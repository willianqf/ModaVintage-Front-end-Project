import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Verifique se o caminho está correto
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './stylesMercadorias'; // Importando os novos estilos
import { theme } from '../global/themes';

type MercadoriasNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Mercadorias'>;

const MercadoriasScreen = () => {
  const navigation = useNavigation<MercadoriasNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gerenciar Mercadorias</Text>

      {/* Card para Listar Mercadorias */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListarMercadorias')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="format-list-bulleted" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Ver Mercadorias</Text>
          <Text style={styles.cardSubtitle}>Listar, editar e visualizar produtos</Text>
        </View>
      </TouchableOpacity>

      {/* Card para Adicionar Mercadoria */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AdicionarMercadoria')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="plus-circle-outline" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Adicionar Mercadoria</Text>
          <Text style={styles.cardSubtitle}>Cadastrar uma nova mercadoria</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MercadoriasScreen;