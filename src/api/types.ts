/**
 * ServeRest payloads use Portuguese field names; the shapes are kept as-is so
 * requests match the API contract exactly.
 */

export interface UserPayload {
  nome: string;
  email: string;
  password: string;
  administrador: 'true' | 'false';
}

export interface ProductPayload {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

export interface CartItem {
  idProduto: string;
  quantidade: number;
}

export interface CartPayload {
  produtos: CartItem[];
}
