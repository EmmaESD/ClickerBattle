import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Animated, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { initializeScores, incrementTeamScore, incrementPlayerScore, subscribeToScores, addPlayer, addActivePlayer, removeActivePlayer } from "../lib/database";

const GameScreen = () => {
    const [personalScore, setPersonalScore] = useState(0);
    const [teamScores, setTeamScores] = useState({ alpha: 0, beta: 0 });
    const [teamPercents, setTeamPercents] = useState({ alpha: '0%', beta: '0%' });
    const [cursorPosition, setCursorPosition] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [spamTexts, setSpamTexts] = useState<Array<{id: number, pseudo: string, team: string, left: number, top: number}>>([]);
    const [clickCount, setClickCount] = useState(0);
    const [autoCursors, setAutoCursors] = useState<number[]>([]);
    const [bonusCooldown, setBonusCooldown] = useState(false);
    const [showBonusButton, setShowBonusButton] = useState(false);
    const [clickingCursors, setClickingCursors] = useState<Set<number>>(new Set());
    const { pseudo, team } = useLocalSearchParams<{ pseudo: string, team: 'alpha' | 'beta' }>();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const setupFirebase = async () => {
            setLoading(true);
            try {
                await initializeScores();
                if (pseudo && team) {
                    await addPlayer(pseudo as string, team as 'alpha' | 'beta');
                    await addActivePlayer(pseudo as string, team as 'alpha' | 'beta');
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
            
            const totalClicks = scores.alpha + scores.beta;
            if (totalClicks > 0) {
                const difference = scores.alpha - scores.beta;
                const newPosition = difference / (totalClicks * 0.1); 
                setCursorPosition(Math.max(-10, Math.min(10, newPosition)));
                
                const alphaPercent = Math.round((scores.alpha / totalClicks) * 100);
                const betaPercent = Math.round((scores.beta / totalClicks) * 100);
                setTeamPercents({
                    alpha: `${alphaPercent}%`,
                    beta: `${betaPercent}%`
                });
            } else {
                setTeamPercents({ alpha: '0%', beta: '0%' });
            }

            const newSpamTexts = activePlayers.map(player => ({
                id: Date.now() + Math.random(),
                pseudo: player.pseudo,
                team: player.team,
                left: Math.random() * 80,
                top: Math.random() * 120 
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
                await incrementTeamScore(team as 'alpha' | 'beta');
                await incrementPlayerScore(pseudo as string);

                setSpamTexts(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    pseudo: pseudo,
                    team: team,
                    left: Math.random() * 80,
                    top: Math.random() * 120
                }]);

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
                
                // Animation des curseurs qui cliquent
                const newClickingCursors = new Set<number>();
                autoCursors.forEach(cursorId => {
                    if (Math.random() > 0.5) { 
                        newClickingCursors.add(cursorId);
                    }
                });
                setClickingCursors(newClickingCursors);
                
                
                setTimeout(() => {
                    setClickingCursors(new Set());
                }, 200);
            }
        }, 1000);

        return () => clearInterval(autoClickInterval);
    }, [autoCursors]);

    useEffect(() => {
        const textTimeout = setTimeout(() => {
            setSpamTexts(prev => prev.slice(1));
        }, 1000);

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
                    style={[styles.bonusButton, team === 'alpha' ? styles.alphaBonusButton : styles.betaBonusButton]} 
                    onPress={handleBonusClick}
                >
                    <Text style={styles.bonusButtonText}>BONUS</Text>
                </TouchableOpacity>
            )}
            <Text style={styles.teamText}>Équipe: {team === 'alpha' ? 'Alpha' : 'Beta'}</Text>
            <Text style={styles.scoreText}>Votre score: {personalScore}</Text>
            
            <View style={styles.cursorContainer}>
                <View style={styles.alphaZone}>
                    <Text style={styles.teamScoreText}>{teamPercents.alpha}</Text>
                </View>
                <View style={styles.cursorTrack}>
                    <View style={[styles.cursor, getCursorStyle()]} />
                </View>
                <View style={styles.betaZone}>
                    <Text style={styles.teamScoreText}>{teamPercents.beta}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.button, team === 'alpha' ? styles.alphaTeam : styles.betaTeam]} 
                onPress={handleClick}
            >
                <Text style={styles.buttonText}>Cliquez !</Text>
            </TouchableOpacity>

            <View style={styles.autoCursorsContainer}>
                {autoCursors.map((cursorId, index) => {
                    const isClicking = clickingCursors.has(cursorId);
                    
                    return (
                        <Text 
                            key={cursorId} 
                            style={[
                                styles.autoCursor,
                                team === 'alpha' ? styles.alphaCursor : styles.betaCursor,
                            ]} 
                        >
                            {isClicking ? '👆' : '🖱️'}
                        </Text>
                    );
                })}
            </View>

            <View style={styles.spamContainer}>
                {spamTexts.map(({ id, pseudo, team, left, top }) => (
                    <Animated.Text
                        key={id}
                        style={[
                            styles.spamText,
                            team === 'alpha' ? styles.alphaText : styles.betaText,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                                left: `${left}%`,
                                top: top
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
        backgroundColor: "#0A0A1A",
        padding: 20,
        backgroundImage: "linear-gradient(180deg, #0A0A1A 0%, #101035 100%)",
    },
    welcomeText: {
        color: "#E0FFFF",
        fontSize: 24,
        marginBottom: 10,
        fontFamily: "monospace",
        textShadowColor: '#50FFA0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    teamText: {
        color: "#E0FFFF",
        fontSize: 18,
        marginBottom: 20,
        fontFamily: "monospace",
        textShadowColor: '#50FFA0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 5,
    },
    scoreText: {
        color: "#E0FFFF",
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
        fontFamily: "monospace",
        textShadowColor: '#50FFA0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    cursorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
        width: "100%",
    },
    alphaZone: {
        width: 40,
        height: 40,
        backgroundColor: "#8A2BE2", // Violet
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#50FFA0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 8,
    },
    betaZone: {
        width: 40,
        height: 40,
        backgroundColor: "#00FF7F", // Vert
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#8A2BE2",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 8,
    },
    cursorTrack: {
        flex: 1,
        height: 10,
        backgroundColor: "#222244",
        borderRadius: 5,
        marginHorizontal: 10,
        position: "relative",
        borderWidth: 1,
        borderColor: "#303060",
        shadowColor: "#50FFA0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    cursor: {
        width: 20,
        height: 20,
        backgroundColor: "#E0FFFF",
        borderRadius: 10,
        position: "absolute",
        top: -5,
        left: "50%",
        marginLeft: -10,
        shadowColor: "#50FFA0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 8,
    },
    teamScoreText: {
        color: "#E0FFFF",
        fontWeight: "bold",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E0FFFF",
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
    buttonText: {
        color: "#E0FFFF",
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "monospace",
        textShadowColor: '#222244',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
    },
    bonusButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 15,
        borderWidth: 2,
        borderColor: '#E0FFFF',
        shadowColor: "#50FFA0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 8,
        backdropFilter: "blur(10px)",
    },
    alphaBonusButton: {
        backgroundColor: "rgba(138, 43, 226, 0.7)", // Violet transparent
        borderColor: "#8A2BE2",
    },
    betaBonusButton: {
        backgroundColor: "rgba(0, 255, 127, 0.7)", // Vert transparent
        borderColor: "#00FF7F",
    },
    bonusButtonText: {
        color: "#E0FFFF",
        fontSize: 16,
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
        width: 'auto', // Modifier pour que la largeur s'adapte au contenu
        maxWidth: '40%', // Limiter la largeur maximale
        opacity: 0.8,
        fontFamily: "monospace",
    },
    alphaText: {
        color: '#8A2BE2', 
        textShadowColor: '#50FFA0',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    betaText: {
        color: '#00FF7F', // Vert
        textShadowColor: '#8A2BE2',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    autoCursor: {
        fontSize: 24,
        opacity: 0.8,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        marginHorizontal: 5,
    },
    autoCursorsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
        maxWidth: '100%',
    },
    alphaCursor: {
        textShadowColor: "#8A2BE2", // Violet pour l'équipe Alpha
    },
    betaCursor: {
        textShadowColor: "#00FF7F", // Vert pour l'équipe Beta
    },
})
 
export default GameScreen;