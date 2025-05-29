import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho
import { styles } from './stylesMercadorias'; // Criar este arquivo de estilos

// Tipagem para a prop de navegação
type MercadoriasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Mercadorias'>;

// TODO: Definir as telas de destino para Adicionar e Listar
// export type MercadoriasStackParamList = {
//   MercadoriasHome: undefined;
//   AdicionarMercadoria: undefined;
//   ListarMercadorias: undefined;
// };
export default function MercadoriasScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Usar o tipo genérico ou o específico

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mercadorias</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => { navigation.navigate('AdicionarMercadoria'); /* Alert.alert("Ação", "Navegar para Adicionar Mercadoria"); */}}
      >
        <Text style={styles.actionButtonText}>+ Adicionar Mercadoria</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => { navigation.navigate('ListarMercadorias'); /* Alert.alert("Ação", "Navegar para Listar Mercadorias"); */ }}
      >
        <Text style={styles.actionButtonText}>Listar Mercadorias</Text>
      </TouchableOpacity>
    </View>
  );
}