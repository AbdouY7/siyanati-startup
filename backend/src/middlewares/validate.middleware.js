import { ZodError } from "zod";

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    next(error);
  }
};
