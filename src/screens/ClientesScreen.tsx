import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Verifique o caminho
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './stylesClientes'; // Importando os novos estilos
import { theme } from '../global/themes';

type ClientesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Clientes'>;

const ClientesScreen = () => {
  const navigation = useNavigation<ClientesNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gerenciar Clientes</Text>

      {/* Card para Listar Clientes */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListarClientes')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="account-search-outline" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Listar Clientes</Text>
          <Text style={styles.cardSubtitle}>Listar, editar e visualizar clientes</Text>
        </View>
      </TouchableOpacity>

      {/* Card para Adicionar Cliente */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AdicionarCliente')} // Funcionalidade mantida
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="account-plus-outline" size={30} color={theme.colors.primary} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Adicionar Cliente</Text>
          <Text style={styles.cardSubtitle}>Cadastrar um novo cliente</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ClientesScreen;