import { z } from 'zod';

/** Response contracts for ServeRest, used by the API tests as schema checks. */

export const userSchema = z.object({
  _id: z.string().min(1),
  nome: z.string(),
  email: z.string().email(),
  password: z.string(),
  administrador: z.enum(['true', 'false']),
});

export const userListSchema = z.object({
  quantidade: z.number().int().nonnegative(),
  usuarios: z.array(userSchema),
});

export const productSchema = z.object({
  _id: z.string().min(1),
  nome: z.string(),
  preco: z.number().int().positive(),
  descricao: z.string(),
  quantidade: z.number().int().nonnegative(),
});

export const productListSchema = z.object({
  quantidade: z.number().int().nonnegative(),
  produtos: z.array(productSchema),
});

export const cartItemSchema = z.object({
  idProduto: z.string().min(1),
  quantidade: z.number().int().positive(),
  precoUnitario: z.number().int().positive(),
});

export const cartSchema = z.object({
  _id: z.string().min(1),
  produtos: z.array(cartItemSchema).min(1),
  precoTotal: z.number().int().nonnegative(),
  quantidadeTotal: z.number().int().positive(),
  idUsuario: z.string().min(1),
});

export const cartListSchema = z.object({
  quantidade: z.number().int().nonnegative(),
  carrinhos: z.array(cartSchema),
});

export const createdSchema = z.object({
  message: z.string(),
  _id: z.string().min(1),
});

export const loginSchema = z.object({
  message: z.string(),
  authorization: z.string().startsWith('Bearer '),
});
