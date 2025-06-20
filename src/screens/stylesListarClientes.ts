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

  // --- Card de Cliente ---
  itemContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: 8,
    padding: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  itemContent: {
    marginBottom: theme.spacing.md,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  itemDetails: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
    lineHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDetailsText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
  },

  // --- Botões de Ação ---
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: `${theme.colors.primary}1A`,
  },
  deleteButton: {
    backgroundColor: `${theme.colors.error}15`,
  },
  actionButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  editText: {
    color: theme.colors.primary,
  },
  deleteText: {
    color: theme.colors.error,
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