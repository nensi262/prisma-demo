export type ZodValidationError = {
  code: string;
  message: string;
  path: string[];
  validation: string;
  exact?: boolean;
  inclusive?: boolean;
  minimum?: number;
  maximum?: number;
};
