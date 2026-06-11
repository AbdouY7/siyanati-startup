const prisma = require('./src/prisma/client');

async function test() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
      console.log('No admin found');
      return;
    }
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: admin.id, role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

    const store = await prisma.storeProfile.findFirst({ 
      where: { 
        documents: { isEmpty: false } 
      } 
    });
    
    // Find a Cloudinary URL
    const docPath = store.documents.find(d => d.startsWith('http')) || store.documents[0];
    console.log('Testing document path:', docPath);

    const res = await fetch(`http://localhost:3001/api/admin/documents/view?path=${encodeURIComponent(docPath)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const buffer = await res.arrayBuffer();
    console.log('Size:', buffer.byteLength);
  } catch (err) {
    console.error('Error:', err);
  }
}

test().finally(() => prisma.$disconnect());
