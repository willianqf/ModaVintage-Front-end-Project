import { StyleSheet } from 'react-native';
import { theme } from '../global/themes';

export const styles = StyleSheet.create({
  // --- Layout e Cabeçalho ---
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.surface,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },

  // --- Grupo de Formulário (Rótulo + Input) ---
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.placeholder,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },

  // --- Botão de Adicionar Foto (Estilo Secundário) ---
  imagePickerButton: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.placeholder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.placeholder}10`,
  },
  imagePickerText: {
    color: theme.colors.placeholder,
    fontWeight: 'bold',
  },

  // --- Botões de Ação ---
  buttonContainer: {
    marginTop: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.success,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
});