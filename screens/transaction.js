import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config";
const BgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class Transaction extends Component {
  constructor() {
    super();
    this.state = {
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      scanneData: "",
      bookId: "",
      studentId: "",
      bookName: "",
      studentName: "",
    };
  }

  handleTransaction = async () => {
    const { bookId, studentId } = this.state;

    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    var transactionType = await this.checkBookAvailbility(bookId)

      if (transactionType === "issue") {
          var isStudentEligible = await this.checkStudentForBookIssue(studentId)
          if (isStudentEligible == true){
            const { bookName, studentName } = this.state;
            this.initiateBookIssue(bookId, studentId, bookName, studentName);
          }

          Alert.alert("Livro retirado pelo aluno!")
       
        } else if (transactionType === "return") {
          var isStudentEligible = await this.checkStudentForBookReturn(bookId, studentId)
          if (isStudentEligible == true){
            const { bookName, studentName } = this.state;
            this.initiateBookReturn(bookId, studentId, bookName, studentName);
          }
        
          Alert.alert("Livro devolvido para a biblioteca!")
        
        }else if (transactionType === "false") {
          this.setState({
            bookId: "",
            studentId:"",
          });

          Alert.alert("O livro não existe no Banco de Dados")
        }
      
  };

  checkBookAvailbility = async (bookId) => {
    const bookRef = await db.collection("books")
    .where("book_id", "==", bookId).get();

    var transactionType = "";
    if(bookRef .docs.length === 0){
      transactionType = false
    }else {
      bookRef.docs.map(doc => (
        transactionType = doc.data().is_book_available ? "issue" : "return"
      ))
    }

    return transactionType;
  };

  checkStudentForBookIssue  = async (studentId) =>{
    const studentRef = await db.collection ("students")
    .whare('student_id', '==', studentId).get();
    
    var isStudentEligible = "";
    if(studentRef.doc.length === 0){
      this.setState({
        bookId:"",
        studentId:"",
      })
      
      isStudentEligible = false
      Alert.alert("O id do Aluno não existe no Banco de Dados")
    }else {
      studentRef.doc.map(doc => {
        if (doc.data().number_of_books_issued < 2){
          isStudentEligible = true
        }else{
          isStudentEligible = false

          Alert.alert = ("O Aluno já retirou 2 livros")
          this.setState({
            bookId:"",
            studentId:"",
          })
        }
      })
    }
    return isStudentEligible;
  };

  checkStudentForBookReturn = async (bookId, studentId) => {
    const transactionRef = await db.collection("transaction")
    .whare("book_id", "==", bookId)
    .limit(1)
    .get();

    var isStudentEligible = "";
    transactionRef.docs.map(doc => {
      var lastBookTransaction = doc.data();
      if(lastBookTransaction.student_id === studentId){
        isStudentEligible = true
      }else {
        isStudentEligible = false

        Alert.alert("O livro não foi retirado por este Aluno")
        this.setState({
          bookId:"",
          studentId:"",
        })
      }
    })
    return isStudentEligible; 
  }

  getBookDetails = (bookId) => {
    bookId = bookId.trim();
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            bookName: doc.data().book_name,
          });
        });
      });
  };

  getStudentDetails = (studentId) => {
    studentId = studentId.trim();
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            studentName: doc.data().student_name,
          });
        });
      });
  };

  initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue",
    });

    //alterar status do livro
    db.colletion("books").doc(bookId).update({
      is_book_available: false,
    });

    //alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(1),
      });

    //limpando os campos de bookId e studentId
    this.setState({
      bookId: "",
      studentId: "",
    });
  };

  initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return",
    });

    //alterar status do livro
    db.colletion("books").doc(bookId).update({
      is_book_available: true,
    });

    //alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(-1),
      });

    //limpando os campos de bookId e studentId
    this.setState({
      bookId: "",
      studentId: "",
    });
  };

  getCameraPermissions = async (domState) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false,
    });
  };

  handleBarCodeScanner = async (type, data) => {
    const { domState } = this.state;
    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true,
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true,
      });
    }
  };

  render() {
    const { domState, hasCameraPermissions, scanned, scannedData } = this.state;
    if (domState === "scanner") {
      return (
        <BarCodeScanner
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanner}
        />
      );
    }
    return (
      <KeyboardAvoidingView behavior = "pedding" style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              <TextInput
                style={styles.textinput}
                placeholder={"ID do Livro"}
                placeholderTextColor={"#FFFFFF"}
                value={bookId}
                onChangeText = {text => this.setState ({bookId: text})}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("bookId")}
              >
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                style={styles.textinput}
                placeholder={"ID do Estudante"}
                placeholderTextColor={"#FFFFFF"}
                value={studentId}
                onChangeText = {text => this.setState ({studentId: text})}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Enviar</Text>
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
