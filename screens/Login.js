import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import firebase from "firebase";

const BgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      senha: "",
    };
  }

  handleLogin = async (email, senha) => {
    await firebase
      .auth()
      .singInWithEmailAndPassword(email, senha)
      .then(() => {
        this.props.navigation.navigate("BottomTab");
      })
      .catch((error) => {
        Alert.alert(error.message);
      });
  };

  render() {
    return (
      <KeyboardAvoidingView behavior="pedding" style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <TextInput
              style={styles.textinput}
              placeholder={"Digite seu e-mail"}
              placeholderTextColor={"#FFFFFF"}
              value={this.state.email}
              onChangeText={(text) => this.setState({ email: text })}
            />
            <TextInput
              style={styles.textinput}
              placeholder={"Digite sua senha"}
              placeholderTextColor={"#FFFFFF"}
              value={this.state.senha}
              onChangeText={(text) => this.setState({ senha: text })}
            />
            <TouchableOpacity
              onPress={() =>
                this.handleLogin(this.state.email, this.state.senha)
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80,
  },
  appName: {
    width: 180,
    resizeMode: "contain",
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center",
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF",
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF",
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanbuttonText: {
    fontSize: 20,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold",
  },
  button: {
    marginTop: 20,
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    ontFamily: "Rajdhani_600SemiBold",
  },
});
