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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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

  // --- SEÇÃO DE FOTO REESTRUTURADA ---
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  imagePreview: {
    width: 150,
    height: 150,
    // CORRIGIDO AQUI
    borderRadius: theme.borderRadius.md, 
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    // CORRIGIDO AQUI
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.placeholder}10`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.placeholder,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.placeholder,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignSelf: 'center',
  },
  imagePickerButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
    fontSize: 16,
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
