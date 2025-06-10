export type RootStackParamList = {
  Login: undefined;
  Register: undefined; // A tela de Registro está aqui
  SolicitarResetSenha: undefined;
  ResetarSenha: { token: string }; // Exemplo se precisasse passar o token na rota

  // Telas autenticadas
  Dashboard: undefined;
  Clientes: undefined;
  ListarClientes: undefined;
  AdicionarCliente: undefined;
  EditarCliente: { clienteId: number };

  Fornecedores: undefined;
  ListarFornecedores: undefined;
  AdicionarFornecedor: undefined;
  EditarFornecedor: { fornecedorId: number };

  Mercadorias: undefined;
  ListarMercadorias: undefined;
  AdicionarMercadoria: undefined;
  EditarMercadoria: { mercadoriaId: number };

  Vendas: undefined;
  ListarVendas: undefined;
  RegistrarVenda: undefined;

  Status: undefined;
};