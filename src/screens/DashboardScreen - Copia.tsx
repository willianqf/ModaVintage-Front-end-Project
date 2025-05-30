import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'; // Adicionado Alert
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

interface DashboardScreenProps {
  onLogout: () => void;
}

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const navigation = useNavigation<DashboardNavigationProp>();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    onLogout();
  };

  const menuItems = [
    { title: 'Mercadorias', routeName: 'Mercadorias' as keyof RootStackParamList },
    { title: 'Clientes', routeName: 'Clientes' as keyof RootStackParamList },
    { title: 'Vendas', routeName: 'VendasScreen' as keyof RootStackParamList },
    { title: 'Fornecedores', routeName: 'FornecedoresScreen' as keyof RootStackParamList },
    { title: 'Status/Relatórios', routeName: 'StatusScreen' as keyof RootStackParamList },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.welcomeTitle}>Bem-vindo, Lília!</Text>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.routeName}
            style={styles.menuButton}
            onPress={() => {
              if (item.routeName) { // Verifica se a rota está definida
                try {
                  navigation.navigate(item.routeName as any); // 'as any' para simplificar a tipagem aqui, idealmente tipar melhor
                } catch (e) {
                    console.error("Erro de navegação:", e)
                    Alert.alert("Navegação", `Tela para ${item.title} ainda não implementada ou erro na rota.`);
                }
              } else {
                Alert.alert("Navegação", `Rota para ${item.title} não definida.`);
              }
            }}
          >
            <Text style={styles.menuButtonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.logoutButtonContainer}>
          <Button title="Logout" onPress={handleLogout} color="#8B0000" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f3f3f3',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#323588',
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: '#5DBEDD',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButtonContainer: {
    marginTop: 20,
    width: '85%',
  }
});