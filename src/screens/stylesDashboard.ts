import { StyleSheet } from 'react-native';
import { theme } from '../global/themes'; // CORRIGIDO: Importação nomeada

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // CORRIGIDO
  },
  header: {
    backgroundColor: theme.colors.primary, // CORRIGIDO
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl, // CORRIGIDO
    color: theme.colors.surface,   // CORRIGIDO
    fontWeight: 'bold',
  },
  mainContent: {
    padding: theme.spacing.md, // CORRIGIDO
  },
  title: {
    fontSize: theme.fontSizes.lg, // CORRIGIDO
    color: theme.colors.text,     // CORRIGIDO
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg, // CORRIGIDO
    textAlign: 'center',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.surface, // CORRIGIDO
    padding: theme.spacing.md,             // CORRIGIDO
    borderRadius: 15,
    marginBottom: theme.spacing.md,      // CORRIGIDO
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardTitle: {
    fontSize: theme.fontSizes.md,  // CORRIGIDO
    color: theme.colors.primary, // CORRIGIDO
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,   // CORRIGIDO
    textAlign: 'center',
  },
  cardFullWidth: {
    width: '100%',
  },
});