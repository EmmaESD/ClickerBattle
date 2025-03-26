import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Animated } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { initializeScores, incrementTeamScore, incrementPlayerScore, subscribeToScores, addPlayer, addActivePlayer, removeActivePlayer } from "../lib/database";

const GameScreen = () => {
    const [personalScore, setPersonalScore] = useState(0);
    const [teamScores, setTeamScores] = useState({ blue: 0, red: 0 });
    const [teamPercents, setTeamPercents] = useState({ blue: '0%', red: '0%' });
    const [cursorPosition, setCursorPosition] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [spamTexts, setSpamTexts] = useState<Array<{id: number, pseudo: string, team: string}>>([]);
    const [clickCount, setClickCount] = useState(0);
    const [autoCursors, setAutoCursors] = useState<number[]>([]);
    const [bonusCooldown, setBonusCooldown] = useState(false);
    const [showBonusButton, setShowBonusButton] = useState(false);
    const { pseudo, team } = useLocalSearchParams<{ pseudo: string, team: 'blue' | 'red' }>();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const setupFirebase = async () => {
            setLoading(true);
            try {
                await initializeScores();
                if (pseudo && team) {
                    await addPlayer(pseudo as string, team as 'blue' | 'red');
                    await addActivePlayer(pseudo as string, team as 'blue' | 'red');
                }
                setLoading(false);
            } catch (error) {
                console.error("Erreur d'initialisation:", error);
                setLoading(false);
            }
        };
        
        setupFirebase();

        const unsubscribe = subscribeToScores(({ scores, activePlayers }) => {
            setTeamScores(scores);
            
            const totalClicks = scores.blue + scores.red;
            if (totalClicks > 0) {
                const difference = scores.blue - scores.red;
                const newPosition = difference / (totalClicks * 0.1); 
                setCursorPosition(Math.max(-10, Math.min(10, newPosition)));
                
                const bluePercent = Math.round((scores.blue / totalClicks) * 100);
                const redPercent = Math.round((scores.red / totalClicks) * 100);
                setTeamPercents({
                    blue: `${bluePercent}%`,
                    red: `${redPercent}%`
                });
            } else {
                setTeamPercents({ blue: '0%', red: '0%' });
            }

            // Mettre à jour les spamTexts avec les joueurs actifs
            const newSpamTexts = activePlayers.map(player => ({
                id: Date.now() + Math.random(),
                pseudo: player.pseudo,
                team: player.team
            }));
            setSpamTexts(newSpamTexts);
        });

        return () => {
            unsubscribe();
            if (pseudo) {
                removeActivePlayer(pseudo);
            }
        };
    }, [pseudo, team]);

    const handleClick = async () => {
        setPersonalScore(prev => prev + 1);
        setClickCount(prev => prev + 1);
        
        try {
            if (pseudo && team) {
                await incrementTeamScore(team as 'blue' | 'red');
                await incrementPlayerScore(pseudo as string);

                // Ajouter le pseudo du joueur qui clique aux spamTexts
                setSpamTexts(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    pseudo: pseudo,
                    team: team
                }]);

                // Animation d'apparition
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 3,
                        tension: 40,
                        useNativeDriver: true,
                    })
                ]).start();

                // Animation de disparition
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                            toValue: 0.5,
                            duration: 500,
                            useNativeDriver: true,
                        })
                    ]).start();
                }, 500);
            }
        } catch (error) {
            console.error("Erreur lors de l'incrémentation du score:", error);
        }
    }

    useEffect(() => {
        if (clickCount >= 10 && !showBonusButton && !bonusCooldown) {
            setShowBonusButton(true);
        }
    }, [clickCount, showBonusButton, bonusCooldown]);

    const handleBonusClick = () => {
        if (!bonusCooldown) {
            setAutoCursors(prev => [...prev, Date.now()]);
            setBonusCooldown(true);
            setShowBonusButton(false);
            
            setTimeout(() => {
                setBonusCooldown(false);
                setClickCount(0);
            }, 30000);
        }
    };

    useEffect(() => {
        const autoClickInterval = setInterval(() => {
            if (autoCursors.length > 0) {
                const baseInterval = 1000;
                const speedMultiplier = Math.max(1, autoCursors.length * 0.5);
                const currentInterval = baseInterval / speedMultiplier;
                
                const clicksPerInterval = Math.floor(speedMultiplier);
                for (let i = 0; i < clicksPerInterval; i++) {
                    handleClick();
                }
            }
        }, 1000);

        return () => clearInterval(autoClickInterval);
    }, [autoCursors]);

    // Effet pour supprimer les textes après leur animation
    useEffect(() => {
        const textTimeout = setTimeout(() => {
            setSpamTexts(prev => prev.slice(1));
        }, 1000); // Supprime le texte après 1 seconde

        return () => clearTimeout(textTimeout);
    }, [spamTexts]);

    const getCursorStyle = () => {
        return {
            transform: [{ translateX: cursorPosition * 10 }],
        };
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Connexion en cours...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showBonusButton && (
                <TouchableOpacity 
                    style={[styles.bonusButton, team === 'blue' ? styles.blueBonusButton : styles.redBonusButton]} 
                    onPress={handleBonusClick}
                >
                    <Text style={styles.bonusButtonText}>BONUS</Text>
                </TouchableOpacity>
            )}
            <Text style={styles.teamText}>Équipe: {team === 'blue' ? 'Bleue' : 'Rouge'}</Text>
            <Text style={styles.scoreText}>Votre score: {personalScore}</Text>
            
            <View style={styles.cursorContainer}>
                <View style={styles.blueZone}>
                    <Text style={styles.teamScoreText}>{teamPercents.blue}</Text>
                </View>
                <View style={styles.cursorTrack}>
                    <View style={[styles.cursor, getCursorStyle()]} />
                </View>
                <View style={styles.redZone}>
                    <Text style={styles.teamScoreText}>{teamPercents.red}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.button, team === 'blue' ? styles.blueTeam : styles.redTeam]} 
                onPress={handleClick}
            >
                <Text style={styles.buttonText}>Cliquez !</Text>
                {autoCursors.map((cursorId, index) => {
                    const angle = (index / autoCursors.length) * 2 * Math.PI;
                    const radius = 40; // Distance du centre
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                        <View 
                            key={cursorId} 
                            style={[
                                styles.autoCursor,
                                {
                                    transform: [{ translateX: x }, { translateY: y }],
                                }
                            ]} 
                        />
                    );
                })}
            </TouchableOpacity>

            

            <View style={styles.spamContainer}>
                {spamTexts.map(({ id, pseudo, team }) => (
                    <Animated.Text
                        key={id}
                        style={[
                            styles.spamText,
                            team === 'blue' ? styles.blueText : styles.redText,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            }
                        ]}
                    >
                        {pseudo}
                    </Animated.Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#000",
        padding: 20,
    },
    welcomeText: {
        color: "#fff",
        fontSize: 24,
        marginBottom: 10,
    },
    teamText: {
        color: "#fff",
        fontSize: 18,
        marginBottom: 20,
    },
    scoreText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },
    cursorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
        width: "100%",
    },
    blueZone: {
        width: 40,
        height: 40,
        backgroundColor: "#007AFF",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    redZone: {
        width: 40,
        height: 40,
        backgroundColor: "#FF3B30",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    cursorTrack: {
        flex: 1,
        height: 10,
        backgroundColor: "#333",
        borderRadius: 5,
        marginHorizontal: 10,
        position: "relative",
    },
    cursor: {
        width: 20,
        height: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        position: "absolute",
        top: -5,
        left: "50%",
        marginLeft: -10,
    },
    teamScoreText: {
        color: "#fff",
        fontWeight: "bold",
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: "center",
    },
    blueTeam: {
        backgroundColor: "#007AFF",
    },
    redTeam: {
        backgroundColor: "#FF3B30",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    bonusButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    blueBonusButton: {
        backgroundColor: "#007AFF",
    },
    redBonusButton: {
        backgroundColor: "#FF3B30",
    },
    bonusButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    loadingText: {
        color: "#fff",
        marginTop: 10,
    },
    spamContainer: {
        marginTop: 20,
        width: '100%',
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    spamText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        marginVertical: 5,
        position: 'absolute',
        width: '100%',
        left: 0,
        right: 0,
        opacity: 0.8,
    },
    blueText: {
        color: '#007AFF',
    },
    redText: {
        color: '#FF3B30',
    },
    autoCursor: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        opacity: 0.5,
        left: '50%',
        top: '50%',
        marginLeft: -10,
        marginTop: -10,
    },
})
 
export default GameScreen;