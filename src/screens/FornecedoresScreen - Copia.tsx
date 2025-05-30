import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesFornecedores';

type FornecedoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FornecedoresScreen'>;

export default function FornecedoresScreen() {
  const navigation = useNavigation<FornecedoresNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Fornecedores</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('AdicionarFornecedor')}
      >
        <Text style={styles.actionButtonText}>+ Adicionar Fornecedor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('ListarFornecedores')}
      >
        <Text style={styles.actionButtonText}>Listar Fornecedores</Text>
      </TouchableOpacity>
    </View>
  );
}