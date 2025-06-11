import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Verifique o caminho
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './stylesVendas'; // Importando os novos estilos
import { theme } from '../global/themes';

type VendasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Vendas'>;

const VendasScreen = () => {
  const navigation = useNavigation<VendasNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gerenciar Vendas</Text>

      {/* Card para Registrar Venda */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RegistrarVenda')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="cart-plus" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Nova Venda</Text>
          <Text style={styles.cardSubtitle}>Registrar uma nova venda no sistema</Text>
        </View>
      </TouchableOpacity>

      {/* Card para Listar Vendas */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListarVendas')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="clipboard-text-search-outline" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Histórico de Vendas</Text>
          <Text style={styles.cardSubtitle}>Consultar o histórico de vendas</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default VendasScreen;