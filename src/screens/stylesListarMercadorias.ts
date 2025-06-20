import { StyleSheet } from 'react-native';
import { theme } from '../global/themes';

export const styles = StyleSheet.create({
  // --- Layout Geral ---
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 40,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },

  // --- Barra de Busca ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  
  // --- Card de Mercadoria ---
  itemContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: 8,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  image: {
    width: 65,
    height: 65,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background, // Cor de fundo para o placeholder da imagem
  },
  detailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#4B0082',
    marginBottom: 4,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    fontSize: 14,
    
    color: theme.colors.text,
    lineHeight: 20,
  },
  itemDetailsBold: {
    color: theme.colors.primary,
  },
  statusContainer: {
    marginTop: 4,
  },
  statusDisponivel: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  statusVendido: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: 'bold',
  },

  // --- Botão de Deletar ---
  deleteButton: {
    backgroundColor: `${theme.colors.error}15`,
    padding: 10,
    borderRadius: 50, // Círculo perfeito
    marginLeft: theme.spacing.md,
  },
  
  // --- Estados da Lista (Loading, Vazio, Erro) ---
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.placeholder,
    fontSize: 16,
  },
  emptyDataText: {
    textAlign: 'center',
    color: theme.colors.placeholder,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
