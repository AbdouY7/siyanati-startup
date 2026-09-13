const fs = require('fs');

const schemaContent = fs.readFileSync('./prisma/schema.prisma', 'utf-8');

let puml = `@startuml
skinparam class {
    BackgroundColor White
    ArrowColor #2688d4
    BorderColor #2688d4
}
skinparam linetype ortho
`;

const enumRegex = /enum\s+(\w+)\s+\{([\s\S]*?)\}/g;
let match;
while ((match = enumRegex.exec(schemaContent)) !== null) {
    const enumName = match[1];
    const enumValues = match[2].trim().split('\n').map(v => v.trim()).filter(v => v && !v.startsWith('//'));
    
    puml += `enum ${enumName} {\n`;
    for (const val of enumValues) {
        puml += `  ${val}\n`;
    }
    puml += `}\n\n`;
}

const modelRegex = /model\s+(\w+)\s+\{([\s\S]*?)\}/g;
const models = {};

while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2].trim().split('\n');
    
    const fields = [];
    
    for (let line of modelBody) {
        line = line.trim();
        if (!line || line.startsWith('//') || line.startsWith('@@')) continue;
        
        // Match field definition: name type attributes
        // Examples: 
        // id String @id @default(uuid())
        // user_id String @unique
        // is_active Boolean @default(true)
        // customer User @relation("CustomerOrders", fields: [customer_id], references: [id])
        
        const fieldMatch = line.match(/^(\w+)\s+([A-Za-z0-9\[\]\?]+)(.*)$/);
        if (fieldMatch) {
            const name = fieldMatch[1];
            const typeStr = fieldMatch[2];
            const rest = fieldMatch[3].trim();
            
            // is it a relationship?
            // if type is not a primitive and not an array of primitive
            const isPrimitive = /^(String|Int|Boolean|DateTime|Decimal|Json|Float|BigInt|Bytes)/.test(typeStr.replace(/[\[\]\?]/g, ''));
            const isEnum = schemaContent.includes(`enum ${typeStr.replace(/[\[\]\?]/g, '')} {`);
            
            if (isPrimitive || isEnum) {
                let note = [];
                if (rest.includes('@id')) note.push('PK');
                if (rest.includes('@unique')) note.push('UK');
                if (name.endsWith('_id') || rest.includes('@relation')) note.push('FK');
                
                fields.push({
                    name,
                    type: typeStr,
                    note: note.length ? `<<${note.join(',')}>>` : '',
                    isRelation: false
                });
            } else {
                // Relationship
                const relType = typeStr.replace('?', ''); // e.g. User, User[]
                const isArray = relType.endsWith('[]');
                const targetModel = relType.replace('[]', '');
                
                fields.push({
                    name,
                    type: typeStr,
                    isRelation: true,
                    targetModel,
                    isArray,
                    rest
                });
            }
        }
    }
    models[modelName] = fields;
}

// Write classes
for (const [modelName, fields] of Object.entries(models)) {
    puml += `class ${modelName} {\n`;
    for (const f of fields) {
        if (!f.isRelation) {
            puml += `  ${f.note ? f.note + ' ' : ''}${f.name}: ${f.type}\n`;
        }
    }
    puml += `}\n\n`;
}

// Write relations
const relationsDrawn = new Set();
for (const [modelName, fields] of Object.entries(models)) {
    for (const f of fields) {
        if (f.isRelation) {
            // Find relation name if any
            const relMatch = f.rest.match(/@relation\("([^"]+)"/);
            const relName = relMatch ? relMatch[1] : '';
            
            const isArray = f.isArray;
            let targetCard = isArray ? '*' : f.type.endsWith('?') ? '0..1' : '1';
            let sourceCard = '1';
            
            // let's just do simple directed association for UML
            const relKey = `${modelName}-${f.targetModel}-${relName}`;
            const revRelKey = `${f.targetModel}-${modelName}-${relName}`;
            
            // To avoid duplicate lines for bidirectional relationships
            if (relationsDrawn.has(revRelKey)) continue;
            
            relationsDrawn.add(relKey);
            
            // Check if bidirectional
            const targetFields = models[f.targetModel];
            let reverseField;
            if (targetFields) {
                if (relName) {
                    reverseField = targetFields.find(tf => tf.isRelation && tf.rest.includes(`@relation("${relName}"`));
                } else {
                    reverseField = targetFields.find(tf => tf.isRelation && tf.targetModel === modelName);
                }
            }
            
            if (reverseField) {
                sourceCard = reverseField.isArray ? '*' : reverseField.type.endsWith('?') ? '0..1' : '1';
            }
            
            puml += `${modelName} "${sourceCard}" -- "${targetCard}" ${f.targetModel} : ${f.name}\n`;
        }
    }
}

puml += `@enduml\n`;

fs.writeFileSync('siyanati-class-diagram.puml', puml);
console.log('Done!');
