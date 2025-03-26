import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from 'expo-router';
import { initializeScores } from "../lib/database";

const HomeScreen = () => {
    const [pseudo, setPseudo] = useState("");
    const [showTeamChoice, setShowTeamChoice] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initFirebase = async () => {
            try {
                await initializeScores();
                setLoading(false);
            } catch (error) {
                console.error("Erreur d'initialisation Firebase:", error);
                setLoading(false);
            }
        };

        initFirebase();
    }, []);

    const handleSubmit = () => {
        if (pseudo.trim()) {
            setShowTeamChoice(true);
        }
    };

    const handleTeamChoice = (team: 'blue' | 'red') => {
        console.log(`Pseudo: ${pseudo}, Équipe: ${team}`);
       
        router.push({
            pathname: "/game",
            params: { pseudo, team }
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Initialisation...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenue dans Clicker Battle</Text>
            {!showTeamChoice ? (
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Entrez votre pseudo"
                        value={pseudo}
                        onChangeText={setPseudo}
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity 
                        style={[styles.button, !pseudo.trim() && styles.buttonDisabled]} 
                        onPress={handleSubmit}
                        disabled={!pseudo.trim()}
                    >
                        <Text style={styles.buttonText}>Valider</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.teamContainer}>
                    <Text style={styles.teamTitle}>Choisissez votre équipe</Text>
                    <View style={styles.teamButtons}>
                        <TouchableOpacity 
                            style={[styles.teamButton, styles.blueTeam]} 
                            onPress={() => handleTeamChoice('blue')}
                        >
                            <Text style={styles.teamButtonText}>Équipe Bleue</Text>
                        </TouchableOpacity> 
                        <TouchableOpacity 
                            style={[styles.teamButton, styles.redTeam]} 
                            onPress={() => handleTeamChoice('red')}
                        >
                            <Text style={styles.teamButtonText}>Équipe Rouge</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    title: {
        color: "#fff",
        fontSize: 24,
        marginBottom: 30,
        textAlign: "center",
    },
    formContainer: {
        width: "80%",
        alignItems: "center",
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    buttonDisabled: {
        backgroundColor: "#666",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    teamContainer: {
        width: "80%",
        alignItems: "center",
    },
    teamTitle: {
        color: "#fff",
        fontSize: 20,
        marginBottom: 30,
        textAlign: "center",
    },
    teamButtons: {
        width: "100%",
        gap: 20,
    },
    teamButton: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    blueTeam: {
        backgroundColor: "#007AFF",
    },
    redTeam: {
        backgroundColor: "#FF3B30",
    },
    teamButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    loadingText: {
        color: "#fff",
        marginTop: 10,
    }
});

export default HomeScreen; 