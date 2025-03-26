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

    const handleTeamChoice = (team: 'alpha' | 'beta') => {
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
                            style={[styles.teamButton, styles.alphaTeam]} 
                            onPress={() => handleTeamChoice('alpha')}
                        >
                            <Text style={styles.teamButtonText}>Équipe Alpha</Text>
                        </TouchableOpacity> 
                        <TouchableOpacity 
                            style={[styles.teamButton, styles.betaTeam]} 
                            onPress={() => handleTeamChoice('beta')}
                        >
                            <Text style={styles.teamButtonText}>Équipe Beta</Text>
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
        backgroundColor: "#0A0A1A",
        backgroundImage: "linear-gradient(180deg, #0A0A1A 0%, #101035 100%)",
    },
    title: {
        color: "#E0FFFF",
        fontSize: 28,
        marginBottom: 30,
        textAlign: "center",
        fontFamily: "monospace",
        textShadowColor: '#50FFA0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    formContainer: {
        width: "80%",
        alignItems: "center",
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "rgba(224, 255, 255, 0.1)",
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        color: "#E0FFFF",
        borderWidth: 1,
        borderColor: "#50FFA0",
        fontFamily: "monospace",
        shadowColor: "#50FFA0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    button: {
        backgroundColor: "rgba(138, 43, 226, 0.7)", // Violet transparent
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#8A2BE2",
        shadowColor: "#50FFA0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
        backdropFilter: "blur(10px)",
    },
    buttonDisabled: {
        backgroundColor: "rgba(102, 102, 102, 0.3)",
        borderColor: "#444",
        shadowOpacity: 0.2,
    },
    buttonText: {
        color: "#E0FFFF",
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "monospace",
        textShadowColor: '#222244',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    teamContainer: {
        width: "80%",
        alignItems: "center",
    },
    teamTitle: {
        color: "#E0FFFF",
        fontSize: 22,
        marginBottom: 30,
        textAlign: "center",
        fontFamily: "monospace",
        textShadowColor: '#50FFA0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    teamButtons: {
        width: "100%",
        gap: 20,
    },
    teamButton: {
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
        borderWidth: 2,
        shadowColor: "#50FFA0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 8,
        backdropFilter: "blur(10px)",
    },
    alphaTeam: {
        backgroundColor: "rgba(138, 43, 226, 0.7)", // Violet transparent
        borderColor: "#8A2BE2", 
    },
    betaTeam: {
        backgroundColor: "rgba(0, 255, 127, 0.7)", // Vert transparent
        borderColor: "#00FF7F",
    },
    teamButtonText: {
        color: "#E0FFFF", 
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "monospace",
        textShadowColor: '#222244',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    loadingText: {
        color: "#E0FFFF",
        marginTop: 10,
        fontFamily: "monospace",
        textShadowColor: '#50FFA0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 5,
    }
});

export default HomeScreen; 