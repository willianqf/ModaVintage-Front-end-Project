import { StyleSheet } from 'react-native';
import { theme } from '../global/themes';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    // Sombra
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    // Círculo com a cor primária de fundo e baixa opacidade
    backgroundColor: `${theme.colors.primary}20`,
    padding: theme.spacing.md,
    borderRadius: 50,
    marginRight: theme.spacing.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
});