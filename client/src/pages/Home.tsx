import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box, Alert } from "@mui/material";

const Home = () => {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [link, setLink] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleJoinRoom = () => {
        if (roomId.trim() && username.trim()) {
            navigate(`/room/${roomId.trim()}/${username.trim()}`);
        } else {
            setError("Both room ID and username are required.");
        }
    };

    const handleGenerateLink = () => {
        if (roomId.trim() && username.trim()) {
            setLink(`${window.location.origin}/room/${roomId.trim()}`);
            setError("");
        } else {
            setError("Both room ID and username are required.");
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                padding: 2,
            }}>

            <Box
               sx={{
                  width: "100%",
                  maxWidth: "400px",
                  padding: 4,
                  borderRadius: 2,
                  boxShadow: 3,
                  border: '1px solid',
                  borderColor: 'primary.main', 
                }}>

                <Typography variant="h4" gutterBottom align="center" color="primary">
                    Join Room
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ marginBottom: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="Room ID"
                    variant="outlined"
                    fullWidth
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGenerateLink}
                    >
                        Generate Invitation Link
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleJoinRoom}
                    >
                        Join Room
                    </Button>
                </Box>

                {link && (
                    <Box sx={{ marginTop: 3, textAlign: "center" }}>
                        <Typography variant="body1" sx={{ marginBottom: 1 }}>
                            Invitation Link: 
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#f1f1f1",
                                padding: 1,
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="body2" sx={{ 
                              marginRight: 1,
                              color: '#000'
                              }}>
                                {link}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => navigator.clipboard.writeText(link)}
                            >
                                Copy
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Home;
