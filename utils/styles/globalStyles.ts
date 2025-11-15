import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#0A0F12",
        flex: 1,
    },
    centercontainer: {
        padding: 20,
        backgroundColor: "#0A0F12",
        flex: 1,
        justifyContent:'center'
    },
    innerContainer: {
        padding: 5,
        backgroundColor: "#0A0F12",
    },
    PageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color : "#fff"
    },
    mainInfo: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color:"#fff"
    },
    homePageCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#122025",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    card: {
        borderWidth: 1,
        backgroundColor : "#122025",
        borderRadius: 8,
        marginBottom: 10,
        overflow: "hidden",
    },
    title: {
        width: 120, // fixed width for AppName column
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    username: {
        flex: 1, // fills space between AppName and icon
        fontSize: 16,
        fontWeight: "400",
        color: "#fff",
        textAlign: "left",
    },
    input: {
        backgroundColor: "#1B2329",
        // borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 14,
        fontSize: 16,
        color: '#fff',                // black text
        // marginTop: 15
    },
    editPageInput: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',                // black text
    },
    picker: {
        backgroundColor: "#1B2329",
        color: '#fff',
        borderRadius: 12,
        marginBottom: 0,
        width: "100%",
    },
    pickerWrapper: {
        backgroundColor: "#1B2329",
        borderColor: "#1B2329",
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',       // important for borderRadius on Android
    },
    section: {
        marginBottom: 15,
        backgroundColor: '#fff',      // white card
        borderRadius: 8,
        padding: 12,
        elevation: 2,
    },
    label: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#333",
        marginBottom: 5,
    },
    value: {
        fontSize: 15,
        color: "#555",
    },
    linkButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 0
    },
    linkText: {
        color: "#fff",                // white text for blue button
        fontWeight: "bold",
    },
    saveButton: {
        backgroundColor: "#4caf50",
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 20,
    },
    saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    },
});