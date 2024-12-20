// TODO:
// Add the Fifty-move rule
// Add the Threefold repetition rule
// Add the Dead position rule
// Refactor updateCheckMoves()
// Fix performance
// Clean the code and add comments

// Initial global declarations
var tileColorOne = "#c19261";
var tileColorTwo = "#258e2c";
var darkmode = true;
var boardSwitch = false;
var tilePicked1 = null;
var tilePicked2 = null;
var clickLegalMoves = [];
var clickPieceName = "";
var isBlackTurn = false;
var isCheck = false;
var legalMoveCounter = 0;
var noLegalMoves = false;
var gameEnd = false;
var canCastle = false;
var castleBlackRookA = "";
var castleBlackRookH = "";
var castleWhiteRookA = "";
var castleWhiteRookH = "";
var blackPromotionPositions = [56, 57, 58, 59, 60, 61, 62, 63];
var whitePromotionPositions = [0, 1, 2, 3, 4, 5, 6, 7];
var queenCounter = 0;
var enpassant = [];

var globalPositions = []; // An array containing all piece positions and their names
for (let i = 0; i < 64; i++) { // Initially fills it with empty strings
    globalPositions.push("");
}
var testGlobalPositions = globalPositions.slice(); // A copy of that array for checking for checks and checkmates

// Paints the board in a checkerboard pattern
function drawCheckeredPattern(){
    for (let i = 0; i < 64; i++){
        let x = i % 8;
        let y = (i - x) / 8;
        if ((x + y) % 2 != 0){
            document.getElementById(i).style.backgroundColor = tileColorTwo;
        }
        else{
            document.getElementById(i).style.backgroundColor = tileColorOne;
        }
    }
}

function darkmodeToggle(){
    if(darkmode){
        darkmode = false;
        document.getElementsByTagName("body")[0].style.backgroundColor = "#ffffff";
    }
    else{
        darkmode = true;
        document.getElementsByTagName("body")[0].style.backgroundColor = "#28282e";
    }
}

// Switches the board around
function switchSides(){
    undrawLegalMoves();
    if(boardSwitch){
        boardSwitch = false;
        addTileIds();
    }
    else{
        boardSwitch = true;
        addTileIds(true);
    }
    addTileListeners(true);
    redrawAllPieces();
    console.log(tilePicked1)
    if(tilePicked1 != null){
        drawLegalMoves();
    }
}

// Adds event listeners for clickEvent() in each tile element
function addTileListeners(replace){
    if (replace == undefined){
        replace = false;
    }
    if(replace){
        // Nukes all tile elements and replaces them with new ones
        // Thus resetting all event listeners
        for (let i = 0; i < 64; i++) {
            const tileElement = document.getElementById(i);
            tileElement.replaceWith(tileElement.cloneNode(true));;
        }
    }
    // Adds the event listeners
    for (let i = 0; i < 64; i++) {
        document.getElementById(i).addEventListener("click", function(){clickEvent(i);});
    }
}

// Adds/changes the IDs of each tile element in the html file
function addTileIds(reverse){
    if (reverse == undefined){
        reverse = false;
    }
    // Gets used in switchSides()
    if(reverse){
        for (let i = 0; i < 64; i++) {
            document.getElementsByClassName("tile")[i].id = 63 - i;
        }
    }
    else{
        for (let i = 0; i < 64; i++) {
            document.getElementsByClassName("tile")[i].id = i;
        }
    }
}

// Redraws all pieces on the board
function redrawAllPieces(){
    for (let i = 0; i < 64; i++) {
        drawPiece("", i);
        pieceName = globalPositions[i];
        if(pieceName != ""){
            piecePosition = window[pieceName]["position"];
            drawPiece(window[pieceName]["pieceIcon"], piecePosition);
        }
    }
}

// Highlights the legal moves in red
function drawLegalMoves(){
    for (let i = 0; i < clickLegalMoves.length; i++) {
        const tileSelected = clickLegalMoves[i];
        document.getElementById(tileSelected).style.backgroundColor = "#cc2020";
    }
}

// Unhightlights the legal moves
// drawCheckeredPattern() could also be used for this purpose
function undrawLegalMoves(){
    for (let i = 0; i < clickLegalMoves.length; i++) {
        const tileSelected = clickLegalMoves[i];
        let x = tileSelected % 8;
        let y = (tileSelected - x) / 8;
        if ((x + y) % 2 != 0){
            document.getElementById(tileSelected).style.backgroundColor = tileColorTwo;
        }
        else{
            document.getElementById(tileSelected).style.backgroundColor = tileColorOne;
        }
    }
}

// Utility that converts tile positions, from div number to algebraic notation and vice-versa
function tileConvert(tile){
    const letterNotation = "abcdefgh"
    const numberNotation = "12345678";
    if (typeof tile == "number"){
        let x = tile % 8;
        let y = (tile - x) / 8;
        return (letterNotation.charAt(x) + numberNotation.charAt(y));
    }
    else{
        for (let i = 0; i < 8; i++) {
            if (tile.charAt(0) == letterNotation.charAt(i)){
                var x = i;
            }
            if (tile.charAt(1) == numberNotation.charAt(i)){
                var y = i;
            }
        }
        return (y * 8 + x);
    }
}

// Small shortcut utility to draw pieces
function drawPiece(pieceIcon, piecePosition){
    document.getElementById(piecePosition).innerText = pieceIcon;
}

// Functionality for enpassant moves
function checkEnPassantMove(tile, isBlack){
    if(tile === enpassant[0] && isBlack != enpassant[2]){
        return true;
    }
    else{
        return false;
    }
}

// Checks if it's truly possible to castle and the move selected was a castling move
// Applies the appropriate moves for the rook
// Used in clickEvent()
function castleCheckCheck(){
    if (canCastle && window[clickPieceName]["isKing"]){
        if (isBlackTurn){
            if (tilePicked2 == 2 && castleBlackRookA != ""){
                window[castleBlackRookA]["move"](3);
                window[castleBlackRookA]["firstMove"] = false;
            }
            else if (tilePicked2 == 6 && castleBlackRookH != ""){
                window[castleBlackRookH]["move"](5);
                window[castleBlackRookH]["firstMove"] = false;
            }
        }
        else{
            if (tilePicked2 == 58 && castleWhiteRookA != ""){
                window[castleWhiteRookA]["move"](59);
                window[castleWhiteRookA]["firstMove"] = false;
            }
            else if (tilePicked2 == 62 && castleWhiteRookH != ""){
                window[castleWhiteRookH]["move"](61);
                window[castleWhiteRookH]["firstMove"] = false;
            }
        }
    }
}

// Checks for checks
function checkCheck(isBlackCheck, testMode){
    var check = false
    if (testMode == undefined){
        testMode = false;
    }
    if (testMode){
        var tempPositions = testGlobalPositions; 
    }
    else{
        var tempPositions = globalPositions;
    }
    for (let i = 0; i < tempPositions.length; i++) {
        const tempPiece1 = tempPositions[i];
        if (tempPiece1 != "" && window[tempPiece1]["isBlack"] != isBlackCheck){
            if(window[tempPiece1]["isKing"] && testMode == true){
                window[tempPiece1]["updateLegalMoves"](true);
            }
            else{
                window[tempPiece1]["updateLegalMoves"]();
            }
            const tempLegalMoves = window[tempPiece1]["legalMoves"];
            
            for (let j = 0; j < tempLegalMoves.length; j++) {
                const tempPiece2 = tempPositions[tempLegalMoves[j]];
                if(tempPiece2 != ""){
                    if(window[tempPiece2]["isKing"]){
                        check = true;
                        break;
                    }
                }
            }  
        }
    }
    return(check);
}

// Checks if the inputted tiles aren't within any enemy piece's legal moves
// Used in checkCastling()
function tilesCheck(isBlackCheck, tileList){
    for (let i = 0; i < globalPositions.length; i++) {
        const tempPiece1 = globalPositions[i];
        if (tempPiece1 != "" && window[tempPiece1]["isBlack"] != isBlackCheck && !window[tempPiece1]["isKing"]){
            window[tempPiece1]["updateLegalMoves"]();
            const tempLegalMoves = window[tempPiece1]["legalMoves"];
            for (let j = 0; j < tempLegalMoves.length; j++) {
                if(tileList.includes(tempLegalMoves[j])){
                    return true;
                }
            }
        }
    }
    return false;
}

// Culls the illegal moves for each piece in that turn
function updateCheckMoves(){
    legalMoveCounter = 0;
    testGlobalPositions = globalPositions.slice();
    for (let i = 0; i < testGlobalPositions.length; i++) {
        const tempPiece = testGlobalPositions[i];
        if (tempPiece == ""){}
        else if (window[tempPiece]["isBlack"] == isBlackTurn){ // Checks for the turn
            window[tempPiece]["updateLegalMoves"](); // Updates the possible moves for that piece
            const tempLegalMoves = window[tempPiece]["legalMoves"];
            const currentPosition = window[tempPiece]["position"];
            const badMoveList = [];
            
            // Simulates every possible move for each piece of the color that is being checked
            // Checks if that move is legal 
            // If not, remove them from the list of legal moves for that piece
            for (let j = 0; j < tempLegalMoves.length; j++) {
                const testPosition = tempLegalMoves[j];
                testGlobalPositions = globalPositions.slice();
                window[tempPiece]["move"](testPosition, true);
                if(checkCheck(isBlackTurn, true)){
                    let badMoveIndex = window[tempPiece]["legalMoves"].indexOf(testPosition);
                    badMoveList.push(badMoveIndex);
                }
                window[tempPiece]["move"](currentPosition, true);
            }
            for (let j = badMoveList.length - 1; j >= 0; j--) {
                const element = badMoveList[j];
                window[tempPiece]["legalMoves"].splice(element, 1);
            }
            for (let j = 0; j < window[tempPiece]["legalMoves"].length; j++) {
                legalMoveCounter++;
            }
        }
    }
    if(legalMoveCounter === 0){
        noLegalMoves = true;
    }
}

// Checks for checkmates and stalemates and displays it
function checkMateCheck(){
    if(noLegalMoves){
        if(isCheck){
            //Checkmate!
            if(isBlackTurn){
                document.getElementsByClassName("winscreen")[0].innerText = "White wins!";
            }
            else{
                document.getElementsByClassName("winscreen")[0].innerText = "Black wins!";
            }
        }
        else{
            //Stalemate!
            document.getElementsByClassName("winscreen")[0].innerText = "Stalemate!";
        }
        gameEnd = true;
    }
}

// Main function
// Checks for clicks
// *Reminder to clean up this code*
function clickEvent(n){
    if(gameEnd){}
    // Stores the tile positions of the two clicks, in order
    else if (tilePicked1 == null && globalPositions[n] != ""){ 
        tilePicked1 = n;
        clickPieceName = globalPositions[tilePicked1]; // Finds the name of the piece clicked
        if(clickPieceName != undefined && window[clickPieceName]["isBlack"] == isBlackTurn){ // Checks whos turn it is
            // if (checkCheck(isBlackTurn)){
            //     isCheck = true;
            // }
            // else{
            //     isCheck = false;
            // }
            updateCheckMoves();
            clickLegalMoves = window[clickPieceName]["legalMoves"];
            drawLegalMoves(); // Highlights the legal moves for that piece
        }
    }
    else if (tilePicked1 != null) {
        tilePicked2 = n;
    }

    if (tilePicked2 != null && !gameEnd){
        if(clickPieceName != undefined && window[clickPieceName]["isBlack"] == isBlackTurn){ // Checks whos turn it is
            // Checks if the second tile selected is within the legalMoves array of that piece
            for (let i = 0; i < clickLegalMoves.length; i++) {
                if (tilePicked2 === clickLegalMoves[i]){ // Checks if that move is legal
                    window[clickPieceName]["move"](tilePicked2); // Moves that piece to the tile selected

                    castleCheckCheck(); // Checks for castling moves and moves the rook accordingly

                    // Checks for pawn promotions
                    if (window[clickPieceName]["isPawn"] != undefined){
                        if(isBlackTurn && blackPromotionPositions.includes(tilePicked2)){
                            window[clickPieceName]["promotePawn"]();
                        }
                        else if (!isBlackTurn && whitePromotionPositions.includes(tilePicked2)){
                            window[clickPieceName]["promotePawn"]();
                        }
                    }
                    // Checks if it's that piece's first move
                    if (window[clickPieceName]["firstMove"]){
                        window[clickPieceName]["firstMove"] = false;
                    }
                    // Switches the turn
                    if (isBlackTurn){
                        isBlackTurn = false;
                    }
                    else{
                        isBlackTurn = true;
                    }
                    
                    updateCheckMoves();
                    // Checks for checks
                    if (checkCheck(isBlackTurn)){
                        isCheck = true;
                        //Checks for checkmates and draws
                        checkMateCheck();
                    }
                    else{
                        isCheck = false;
                    }
                    break;
                }
            }
            undrawLegalMoves(); // Unhighlights the legal moves
        }
        // Resets the tiles picked
        tilePicked1 = null;
        tilePicked2 = null;
    }
}

class Piece{
    constructor(name, isBlack, position, isKing){
    this.name = name; // Name of the piece
    this.isBlack = isBlack; // true for Black and false for White
    this.position = tileConvert(position); // Position on the board, takes in standard algebraic notation and converts it to the tile number
    if(isKing){
        this.isKing = true;
    }
    else{
        this.isKing = false;
    }
    }

    // Main move function
    move(movePosition, testMode){ // Takes in numbers from 0 to 59, equal to the tile number
        if(testMode == undefined){
            testMode = false;
        }
        if(!testMode){ // Checks if it's not a test move
            console.log(`${this.name} at position ${tileConvert(this.position)} moved to position ${tileConvert(movePosition)}`);
            drawPiece("", this.position); // Erases the previous tile's emoji
            globalPositions[this.position] = ""; // Erases the previous position from the array

            if(checkEnPassantMove(movePosition, this.isBlack)){
                console.log("AAA")
                globalPositions[enpassant[3]] = "";
                drawPiece("", enpassant[3]);
            }
            else{
                enpassant = [];
            }

            // Checks if it was a double pawn move and logs that to the enpassant global array
            if(movePosition == this.firstMoveMove){
                if(this.isBlack){
                    enpassant = [movePosition - 8, this.name, this.isBlack, movePosition];
                }
                else{
                    enpassant = [movePosition + 8, this.name, this.isBlack, movePosition];
                }
            }

            drawPiece(this.pieceIcon, movePosition);
            globalPositions[movePosition] = this.name; // Adds the new position to the array
        }
        else{
            testGlobalPositions[this.position] = "";
            testGlobalPositions[movePosition] = this.name; // Adds the new position to the test array
        }
        this.position = movePosition;
    }

    // The two methods below are to be used inside of updateLegalMoves()
    // They take in the Number of moves and XY coordinates
    // Then they add the possible legal moves to the legalMoves array
    // checkStraight() is for horizontal and vertical moves, used for the rook, king and queen
    checkStraight(n, x, y){
        var tempX = x;
        var tempY = y;
    
        for (let i = 0; i < n; i++) {
            tempX++;
            if (tempX > 7){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    
        tempX = x;
        tempY = y;
        for (let i = 0; i < n; i++) {
            tempX--;
            if (tempX < 0){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    
        tempX = x;
        tempY = y;
        for (let i = 0; i < n; i++) {
            tempY++;
            if (tempY > 7){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    
        tempX = x;
        tempY = y;
        for (let i = 0; i < n; i++) {
            tempY--;
            if (tempY < 0){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    }
    // checkDiagonal() is for diagonal moves, used for the bishop, king and queen
    checkDiagonal(n, x, y){
        var tempX = x;
        var tempY = y;
    
        for (let i = 0; i < n; i++) {
            tempX++;
            tempY++;
            if (tempX > 7 || tempY > 7){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    
        tempX = x;
        tempY = y;
        for (let i = 0; i < n; i++) {
            tempX--;
            tempY++;
            if (tempX < 0 || tempY > 7){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    
        tempX = x;
        tempY = y;
        for (let i = 0; i < n; i++) {
            tempX++;
            tempY--;
            if (tempX > 7 || tempY < 0){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    
        tempX = x;
        tempY = y;
        for (let i = 0; i < n; i++) {
            tempX--;
            tempY--;
            if (tempX < 0 || tempY < 0){
                break;
            }
            const tempMove = tempY * 8 + tempX;
            const pieceAhead = testGlobalPositions[tempMove];
            if(pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead == undefined){
                break;
            }
            else if (window[pieceAhead]["isBlack"] != this.isBlack){
                this.legalMoves.push(tempMove);
                break;
            }
            else{
                break;
            }
        }
    }
}    

class Pawn extends Piece{
    constructor(name, isBlack, position, isKing){
        super(name, isBlack, position, isKing);
        this.legalMoves = [];
        this.firstMove = true;
        this.firstMoveMove = null;
        this.isPawn = true;

        if (isBlack){
            this.pieceIcon = "♟";
            drawPiece(this.pieceIcon, this.position);
        }
        else{
            this.pieceIcon = "♙";
            drawPiece(this.pieceIcon, this.position);
        }
        globalPositions[this.position] = this.name;
    }

    // Updates the list of legal moves of that pawn
    // *Reminder to clean up this code*
    updateLegalMoves(){
        var pieceAhead = "";
        this.legalMoves = [];
        let x = this.position % 8;
        let y = (this.position - x) / 8;
        if (this.isBlack){
            y += 1;
        }
        else {
            y -= 1;
        }
        let currentMove = y * 8 + x;

        if(testGlobalPositions[currentMove] == ""){ // Checks if the tile is empty
            this.legalMoves.push(currentMove); // Pushes that move to the list of legal moves

            // This is the starting double move that pawns can do, or whatever it's called
            // *Reminder to add the en-passante rule, or whatever it's called*
            if(this.firstMove){
                if(this.isBlack && testGlobalPositions[currentMove + 8] == ""){
                    this.legalMoves.push(currentMove + 8);
                    this.firstMoveMove = currentMove + 8;
                }
                else if(!this.isBlack && testGlobalPositions[currentMove - 8] == ""){
                    this.legalMoves.push(currentMove - 8);
                    this.firstMoveMove = currentMove - 8;
                }
            }
        }

        // Checks if there are enemy pieces in the two diagonals in front
        pieceAhead = testGlobalPositions[currentMove - 1];
        if (pieceAhead != "" && pieceAhead != undefined){
            if(x > 0 && window[testGlobalPositions[currentMove - 1]]["isBlack"] != this.isBlack){
                this.legalMoves.push(currentMove - 1);
        }
        }
        pieceAhead = testGlobalPositions[currentMove + 1];
        if (pieceAhead != "" && pieceAhead != undefined){
            if(x < 7 && window[testGlobalPositions[currentMove + 1]]["isBlack"] != this.isBlack){
                this.legalMoves.push(currentMove + 1);
            }  
        }

        // Special en passant checks
        if(checkEnPassantMove(currentMove + 1, this.isBlack)){
            this.legalMoves.push(currentMove + 1);
        }
        else if(checkEnPassantMove(currentMove - 1, this.isBlack)){
            this.legalMoves.push(currentMove - 1);
        }
    }

    promotePawn(){
        queenCounter++;
        if(this.isBlack){
            var queenName = "blackQueen"+queenCounter;
        }
        else{
            var queenName = "whiteQueen"+queenCounter;
        }
        window["globalThis"][queenName] = new Queen(queenName, this.isBlack, tileConvert(this.position));
        globalPositions[this.position] = queenName;
        window[queenName]["updateLegalMoves"]();
    }
}

class Knight extends Piece{
    constructor(name, isBlack, position, isKing){
        super(name, isBlack, position, isKing);
        this.legalMoves = [];
        this.firstMove = true;

        if (isBlack){
            this.pieceIcon = "♞";
            drawPiece(this.pieceIcon, this.position);
        }
        else{
            this.pieceIcon = "♘";
            drawPiece(this.pieceIcon, this.position);
        }
        globalPositions[this.position] = this.name;
    }

    // *Reminder to clean up this code*
    updateLegalMoves(){
        var pieceAhead = "";
        var tempMoves = [];
        this.legalMoves = [];
        let x = this.position % 8;
        let y = (this.position - x) / 8;

        // This is a TERRIBLE way to do this, i know
        let tempX = x;
        let tempY = y;

        tempX = x + 2;
        tempY = y + 1;
        if(tempX < 8 && tempY < 8){
            tempMoves.push(tempY * 8 + tempX);
        }

        tempX = x + 1;
        tempY = y + 2;
        if(tempX < 8 && tempY < 8){
            tempMoves.push(tempY * 8 + tempX);
        }

        tempX = x - 2;
        tempY = y + 1;
        if(tempX > -1 && tempY < 8){
            tempMoves.push(tempY * 8 + tempX);
        }

        tempX = x - 1;
        tempY = y + 2;
        if(tempX > -1 && tempY < 8){
            tempMoves.push(tempY * 8 + tempX);
        }

        tempX = x + 2;
        tempY = y - 1;
        if(tempX < 8 && tempY > -1){
            tempMoves.push(tempY * 8 + tempX);
        }

        tempX = x + 1;
        tempY = y - 2;
        if(tempX < 8 && tempY > -1){
            tempMoves.push(tempY * 8 + tempX);
        }

        tempX = x - 1;
        tempY = y - 2;
        if(tempX > -1 && tempY > -1){
            tempMoves.push(tempY * 8 + tempX);
        }

        tempX = x - 2;
        tempY = y - 1;
        if(tempX > -1 && tempY > -1){
            tempMoves.push(tempY * 8 + tempX);
        }

        for (let i = 0; i < tempMoves.length; i++) {
            const tempMove = tempMoves[i];
            pieceAhead = testGlobalPositions[tempMove];
            if (pieceAhead == ""){
                this.legalMoves.push(tempMove);
            }
            else if (pieceAhead != undefined){
                if(window[pieceAhead]["isBlack"] != this.isBlack){
                    this.legalMoves.push(tempMove);
                }
            }
        }
    }
}

class Rook extends Piece{
    constructor(name, isBlack, position){
        super(name, isBlack, position);
        this.legalMoves = [];
        this.firstMove = true;

        if (isBlack){
            this.pieceIcon = "♜";
            drawPiece(this.pieceIcon, this.position);
        }
        else{
            this.pieceIcon = "♖";
            drawPiece(this.pieceIcon, this.position);
        }
        globalPositions[this.position] = this.name;
    }

    updateLegalMoves(){
        this.legalMoves = [];
        let x = this.position % 8;
        let y = (this.position - x) / 8;
        this.checkStraight(7, x, y);
    }
}

class King extends Piece{
    constructor(name, isBlack, position, isKing){
        super(name, isBlack, position, isKing);
        this.legalMoves = [];
        this.firstMove = true;

        if (isBlack){
            this.pieceIcon = "♚";
            drawPiece(this.pieceIcon, this.position);
        }
        else{
            this.pieceIcon = "♔";
            drawPiece(this.pieceIcon, this.position);
        }
        globalPositions[this.position] = this.name;   
    }
    updateLegalMoves(testMode){
        if(testMode == undefined){
            testMode = false;
        }
        this.legalMoves = [];
        let x = this.position % 8;
        let y = (this.position - x) / 8;
        this.checkStraight(1, x, y);
        this.checkDiagonal(1, x, y);

        // Checks for castling
        if(!testMode){
            this.checkCastling(this.isBlack);
        }
    }
    checkCastling(isBlack){
        canCastle = false;
        if(!isCheck && this.firstMove){
            
            if(isBlack){
                if(castleBlackRookA == ""){}
                else if(window[castleBlackRookA]["firstMove"] && globalPositions[1] == "" && globalPositions[2] == "" && globalPositions[3] == ""){
                    if(!tilesCheck(isBlack, [0, 1, 2, 3])){
                        this.legalMoves.push(2);
                        canCastle = true;
                    }
                }
                if(castleBlackRookH == ""){}
                else if(window[castleBlackRookH]["firstMove"] && globalPositions[5] == "" && globalPositions[6] == ""){
                    if(!tilesCheck(isBlack, [5, 6, 7])){
                        this.legalMoves.push(6);
                        canCastle = true;
                    }
                }
            }
            else{
                if(castleWhiteRookA == ""){}
                else if(window[castleWhiteRookA]["firstMove"] && globalPositions[57] == "" && globalPositions[58] == "" && globalPositions[59] == ""){
                    if(!tilesCheck(isBlack, [56, 57, 58, 59])){
                        this.legalMoves.push(58);
                        canCastle = true;
                    }
                }
                if(castleWhiteRookH == ""){}
                else if(window[castleWhiteRookH]["firstMove"] && globalPositions[62] == "" && globalPositions[61] == ""){
                    if(!tilesCheck(isBlack, [61, 62, 63])){
                        this.legalMoves.push(62);
                        canCastle = true;
                    }
                }
            }
        }
    }
}

class Bishop extends Piece{
    constructor(name, isBlack, position, isKing){
        super(name, isBlack, position, isKing);
        this.legalMoves = [];
        this.firstMove = true;

        if (isBlack){
            this.pieceIcon = "♝";
            drawPiece(this.pieceIcon, this.position);
        }
        else{
            this.pieceIcon = "♗";
            drawPiece(this.pieceIcon, this.position);
        }
        globalPositions[this.position] = this.name;
    }
    updateLegalMoves(){
        this.legalMoves = [];
        let x = this.position % 8;
        let y = (this.position - x) / 8;
        this.checkDiagonal(7, x, y);
    }
}

class Queen extends Piece{
    constructor(name, isBlack, position, isKing){
        super(name, isBlack, position, isKing);
        this.legalMoves = [];
        this.firstMove = true;

        if (isBlack){
            this.pieceIcon = "♛";
            drawPiece(this.pieceIcon, this.position);
        }
        else{
            this.pieceIcon = "♕";
            drawPiece(this.pieceIcon, this.position);
        }
        globalPositions[this.position] = this.name;
    }
    updateLegalMoves(){
        this.legalMoves = [];
        let x = this.position % 8;
        let y = (this.position - x) / 8;
        this.checkStraight(7, x, y);
        this.checkDiagonal(7, x, y);
    }
}

// Initial commands
addTileIds();
addTileListeners();
drawCheckeredPattern();

var whitePawnA = new Pawn("whitePawnA", false, "a7");
var whitePawnB = new Pawn("whitePawnB", false, "b7");
var whitePawnC = new Pawn("whitePawnC", false, "c7");
var whitePawnD = new Pawn("whitePawnD", false, "d7");
var whitePawnE = new Pawn("whitePawnE", false, "e7");
var whitePawnF = new Pawn("whitePawnF", false, "f7");
var whitePawnG = new Pawn("whitePawnG", false, "g7");
var whitePawnH = new Pawn("whitePawnH", false, "h7");
var whiteRookA = new Rook("whiteRookA", false, "a8");
var whiteKnightB = new Knight("whiteKnightB", false, "b8");
var whiteBishopC = new Bishop("whiteBishopC", false, "c8");
var whiteKing = new King("whiteKing", false, "e8", true);
var whiteQueen = new Queen("whiteQueen", false, "d8");
var whiteBishopF = new Bishop("whiteBishopF", false, "f8");
var whiteKnightG = new Knight("whiteKnightG", false, "g8");
var whiteRookH = new Rook("whiteRookH", false, "h8");

var blackPawnA = new Pawn("blackPawnA", true, "a2");
var blackPawnB = new Pawn("blackPawnB", true, "b2");
var blackPawnC = new Pawn("blackPawnC", true, "c2");
var blackPawnD = new Pawn("blackPawnD", true, "d2");
var blackPawnE = new Pawn("blackPawnE", true, "e2");
var blackPawnF = new Pawn("blackPawnF", true, "f2");
var blackPawnG = new Pawn("blackPawnG", true, "g2");
var blackPawnH = new Pawn("blackPawnH", true, "h2");
var blackRookA = new Rook("blackRookA", true, "a1");
var blackKnightB = new Knight("blackKnightB", true, "b1");
var blackBishopC = new Bishop("blackBishopC", true, "c1");
var blackKing = new King("blackKing", true, "e1", true);
var blackQueen = new Queen("blackQueen", true, "d1");
var blackBishopF = new Bishop("blackBishopF", true, "f1");
var blackKnightG = new Knight("blackKnightG", true, "g1");
var blackRookH = new Rook("blackRookH", true, "h1");

castleBlackRookA = "blackRookA";
castleBlackRookH = "blackRookH";
castleWhiteRookA = "whiteRookA";
castleWhiteRookH = "whiteRookH";