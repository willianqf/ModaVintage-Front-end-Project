import { StyleSheet } from 'react-native';
import { theme } from '../global/themes'; // Importando o tema

export const stylesLogin = StyleSheet.create({
  // --- Contêiner Principal ---
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },

  // --- Logo e Título ---
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },

  // --- Inputs ---
  input: {
    backgroundColor: theme.colors.surface,
    height: 50,
    borderColor: theme.colors.placeholder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },

  // --- Botão Principal ---
  button: {
    backgroundColor: theme.colors.primary,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
  },
  // Estilo para quando o botão estiver desabilitado (carregando)
  buttonDisabled: {
    backgroundColor: theme.colors.primary,
    opacity: 0.7,
  },

  // --- Links ---
  linksContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.md,
  },
  
  // --- Mensagem de Erro (integrada dos seus estilos locais) ---
  errorContainer: {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: '#721C24',
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
  },
});