import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Verifique o caminho
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './stylesFornecedores'; // Importando os novos estilos
import { theme } from '../global/themes';

type FornecedoresNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Fornecedores'>;

const FornecedoresScreen = () => {
  const navigation = useNavigation<FornecedoresNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gerenciar Fornecedores</Text>

      {/* Card para Listar Fornecedores */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListarFornecedores')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Ver Fornecedores</Text>
          <Text style={styles.cardSubtitle}>Listar, editar e visualizar contatos</Text>
        </View>
      </TouchableOpacity>

      {/* Card para Adicionar Fornecedor */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AdicionarFornecedor')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="truck-plus-outline" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Adicionar Fornecedor</Text>
          <Text style={styles.cardSubtitle}>Cadastrar um novo fornecedor</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FornecedoresScreen;