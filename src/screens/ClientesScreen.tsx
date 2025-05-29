import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho
import { styles } from './stylesClientes';

type ClientesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Clientes'>;

export default function ClientesScreen() {
  const navigation = useNavigation<ClientesNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Clientes</Text>
      {/* Layout conforme Figma (Página 7) */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('AdicionarCliente')}
      >
        <Text style={styles.actionButtonText}>+ Adicionar Cliente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('ListarClientes')}
      >
        <Text style={styles.actionButtonText}>Listar Clientes</Text>
      </TouchableOpacity>

      {/*O Figma  Pág 7 
           */}
      {/* FIGMA Pag 7 */}
    </View>
  );
}