/**
 * Response messages returned by ServeRest. The API answers in Portuguese,
 * so the values stay in Portuguese and the keys describe them in English.
 */
export const Messages = {
  loginSuccess: 'Login realizado com sucesso',
  invalidCredentials: 'Email e/ou senha inválidos',

  created: 'Cadastro realizado com sucesso',
  updated: 'Registro alterado com sucesso',
  deleted: 'Registro excluído com sucesso',
  nothingDeleted: 'Nenhum registro excluído',

  emailInUse: 'Este email já está sendo usado',
  userNotFound: 'Usuário não encontrado',
  userHasCart: 'Não é permitido excluir usuário com carrinho cadastrado',

  productNameInUse: 'Já existe produto com esse nome',
  productNotFound: 'Produto não encontrado',
  productInCart: 'Não é permitido excluir produto que faz parte de carrinho',

  cartNotFound: 'Carrinho não encontrado',
  cartDuplicatedProduct: 'Não é permitido possuir produto duplicado',
  cartAlreadyExists: 'Não é permitido ter mais de 1 carrinho',
  cartInsufficientStock: 'Produto não possui quantidade suficiente',
  cartCancelled: 'Registro excluído com sucesso. Estoque dos produtos reabastecido',
  noCartForUser: 'Não foi encontrado carrinho para esse usuário',

  invalidToken: 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
  adminOnly: 'Rota exclusiva para administradores',
} as const;
