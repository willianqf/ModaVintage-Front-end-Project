import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native'; // Alert pode ser removido se não for mais usado
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { styles } from './stylesVendas';

// Certifique-se de que 'VendasScreen' existe em RootStackParamList se esta tela for um destino de navegação também
type VendasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VendasScreen'>;

export default function VendasScreen() {
  const navigation = useNavigation<VendasNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Vendas</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('RegistrarVenda')}
      >
        <Text style={styles.actionButtonText}>+ Registrar Nova Venda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('ListarVendas')} // ALTERADO AQUI
      >
        <Text style={styles.actionButtonText}>Listar Vendas</Text>
      </TouchableOpacity>
    </View>
  );
}