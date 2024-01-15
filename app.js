class ChessGame {
    constructor() {
        this.gameBoard = document.querySelector("#gameboard")
        this.deadPiecesBlack = document.querySelector("#deadPiecesBlack")
        this.deadPiecesWhite = document.querySelector("#deadPiecesWhite")
        this.playerDisplay = document.querySelector("#player")
        this.infoDisplay = document.querySelector("#info-display")
        this.timer = document.querySelector("#timer")
        this.width = 8
        this.playerGo = 'white'
        this.playerDisplay.textContent = 'white'
        this.startpieces = [
            rook, knight, bishop, queen, king, bishop, knight, rook,
            pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
            rook, knight, bishop, queen, king, bishop, knight, rook,
        ]
        this.takenPieces = []

        this.createBoard()
        this.setupEventListeners()
        this.newTimer()

        this.pawnSquare = document.querySelector(`[square-id="${4}"]`).cloneNode(true)
    }

    createBoard() {
        this.startpieces.forEach((startPiece, i) => {
            const square = document.createElement('div')
            square.classList.add('square')
            square.innerHTML = startPiece
            square.firstChild && square.firstChild.setAttribute('draggable', true)
            const reversedIndex = 63 - i
            square.setAttribute('square-id', reversedIndex)
            const row = Math.floor(reversedIndex / 8) + 1
            if (row % 2 === 0) {
                square.classList.add(i % 2 === 0 ? "gray" : "brown")
            } else {
                square.classList.add(i % 2 === 0 ? "brown" : "gray")
            }

            if (i <= 15) {
                square.firstChild.firstChild.classList.add('black')
                square.firstChild.setAttribute('data-moved', 'false')
            }

            if (i >= 48) {
                square.firstChild.firstChild.classList.add('white')
                square.firstChild.setAttribute('data-moved', 'false') 
            }

            this.gameBoard.append(square)
        })
    }

    setupEventListeners() {
        const allSquares = document.querySelectorAll(".square, .piece")

        allSquares.forEach(square => {
            square.addEventListener('dragstart', this.dragStart.bind(this))
            square.addEventListener('dragover', this.dragOver.bind(this))
            square.addEventListener('drop', this.dragDrop.bind(this))
        })
    }

    dragStart(e) {
        this.startPositionId = e.target.parentNode.getAttribute('square-id')
        this.draggedElement = e.target
    }

    dragOver(e) {
        e.preventDefault()
    }

    dragDrop(e) {
        e.stopPropagation()
        const correctGo = this.draggedElement.firstChild.classList.contains(this.playerGo)
        const taken = e.target.classList.contains('piece')
        const valid = this.checkIfValid(e.target)
        const opponentGo = this.playerGo === 'white' ? 'black' : 'white'
        const takenByOpponent = e.target.firstChild && e.target.firstChild.classList.contains(opponentGo)

        if (correctGo) {
            if (takenByOpponent && valid) {
                e.target.parentNode.append(this.draggedElement)
                this.takenPieces.push(e.target.innerHTML)
                this.addDeadPieces(e)
                console.log(this.takenPieces)
                e.target.remove()
                this.checkForWin()
                this.changePlayer()
                this.draggedElement.setAttribute('data-moved', 'true')
                return
            }
            if (taken && !takenByOpponent) {
                this.infoDisplay.textContent = "forbidden to go here!"
                setTimeout(() => this.infoDisplay.textContent = "", 2000)
                return
            }
            if (valid) {
                e.target.append(this.draggedElement)
                this.checkForWin()
                this.changePlayer()
                this.draggedElement.setAttribute('data-moved', 'true')
                return
            }
        }
    }

    addDeadPieces(e){
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = e.target.innerHTML

        if(this.playerGo === "black") this.deadPiecesBlack.append(square)
        else                          this.deadPiecesWhite.append(square)  
    }

    changePlayer() {
        if (this.playerGo === "black") {
            this.reverseIds()
            this.playerGo = "white"
            this.playerDisplay.textContent = 'white'
        } else {
            this.revertIds()
            this.playerGo = "black"
            this.playerDisplay.textContent = 'black'
        }
    }

    blackWin(){
        this.infoDisplay.innerHTML = "Black player wins!"
        const allSquares = document.querySelectorAll('.square')
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
    }

    whiteWin(){
        this.infoDisplay.innerHTML = "White player wins!"
        const allSquares = document.querySelectorAll('.square')
        allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
    }

    checkForWin() {
        const kings = Array.from(document.querySelectorAll('#king'))
        if (!kings.some(king => king.firstChild.classList.contains('white'))) {
            this.blackWin()
        }
        if (!kings.some(king => king.firstChild.classList.contains('black'))) {
            this.whiteWin()
        }
    }

    reverseIds() {
        const allSquares = document.querySelectorAll(".square")
        allSquares.forEach((square, i) =>
            square.setAttribute('square-id', (this.width * this.width - 1) - i)
        )
    }

    revertIds() {
        const allSquares = document.querySelectorAll(".square")
        allSquares.forEach((square, i) => {
            square.setAttribute('square-id', i)
        })
    }

    canCastle(targetId) {
        const startId = Number(this.startPositionId)
        const kingSquare = document.querySelector(`[square-id="${startId}"]`)
        const targetSquare = document.querySelector(`[square-id="${targetId}"]`)

        if (this.draggedElement.id === 'king' && Math.abs(targetId - startId) === 2) {
            if (!this.hasPieceMoved(startId) && !this.hasPieceMoved(targetId)) {
                const direction = targetId > startId ? 1 : -1
                for (let i = startId + direction; i !== targetId; i += direction) {
                    const square = document.querySelector(`[square-id="${i}"]`);
                    if (square.firstChild) {
                        return false
                    }
                }
                return true
            }
        }
        return false
    }

    performCastle(targetId) {
        const startId = Number(this.startPositionId);
        const kingSquare = document.querySelector(`[square-id="${startId}"]`)
        const targetSquare = document.querySelector(`[square-id="${targetId}"]`)

        // Move the king
        targetSquare.append(kingSquare.firstChild)

        // Determine if it's kingside or queenside castling
        const direction = targetId > startId ? 1 : -1

        if(this.playerGo === 'white'){
            if (direction > 0) { // left (kingside)
                const rookSquare = document.querySelector(`[square-id="${targetId + 2}"]`)
                document.querySelector(`[square-id="${targetId - 1}"]`).append(rookSquare.firstChild)
                this.changePlayer()
            } else if (direction < 0) { // right (queenside)
                const rookSquare = document.querySelector(`[square-id="${targetId - 1}"]`)
                document.querySelector(`[square-id="${targetId + 1}"]`).append(rookSquare.firstChild)
                this.changePlayer()
            }
        }
        else if(this.playerGo === 'black'){
            if (direction > 0) { // Kingside
                const rookSquare = document.querySelector(`[square-id="${targetId + 1}"]`)
                document.querySelector(`[square-id="${targetId - 1}"]`).appendChild(rookSquare.firstChild)
                this.changePlayer()
            } else if (direction < 0) { // Queenside
                const rookSquare = document.querySelector(`[square-id="${targetId - 2}"]`)
                document.querySelector(`[square-id="${targetId + 1}"]`).appendChild(rookSquare.firstChild)
                this.changePlayer()
            }
        }
    }

    hasPieceMoved(squareId) {
        const square = document.querySelector(`[square-id="${squareId}"]`)
        return square.firstChild && square.firstChild.getAttribute('data-moved') === 'true'
    }

    pawnToQueen(squareId) {
        const startId = Number(this.startPositionId);
        const startSquare = document.querySelector(`[square-id="${startId}"]`)
        const targetSquare = document.querySelector(`[square-id="${squareId}"]`)
    
        if (squareId >= 56 || squareId <= 7) {
            targetSquare.appendChild(startSquare.firstChild)
            targetSquare.firstChild.id = 'queen'
            targetSquare.innerHTML = queen
            targetSquare.firstChild.setAttribute('draggable', 'true')
            targetSquare.firstChild.setAttribute('data-moved', 'true')
            targetSquare.firstChild.firstChild.classList.add(this.playerGo)
            targetSquare.removeChild(targetSquare.children[1])

            return true
        }
        return false
    }

    newTimer() {
        let minutes = 10;
        let seconds = 0;

        const updateTimerDisplay = () => {
            this.timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        const countdown = setInterval(() => {
            updateTimerDisplay();

            if (minutes === 0 && seconds === 0) {
                clearInterval(countdown);
                if(this.playerGo === 'white') this.blackWin()
                else                          this.whiteWin()
            } else if (seconds === 0) {
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
        }, 1000);
    }
    
    checkIfValid(target) {
        const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'))
        const startId = Number(this.startPositionId)
        const piece = this.draggedElement.id

        if(piece === 'king'){
            if (this.canCastle(targetId)) {
                this.performCastle(targetId)
                return false; 
            }
        }

        switch (piece) {
            case 'pawn':
                const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];
                if(this.pawnToQueen(targetId)) return true

                if (
                    starterRow.includes(startId) && startId + this.width * 2 === targetId ||
                    startId + this.width === targetId ||
                    startId + this.width - 1 == targetId && document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild ||
                    startId + this.width + 1 == targetId && document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild
                ) {
                    return true;
                }
                break;
            case 'knight':
                if (
                    startId + this.width * 2 - 1 === targetId ||
                    startId + this.width * 2 + 1 === targetId ||
                    startId + this.width - 2 === targetId ||
                    startId + this.width + 2 === targetId ||
                    startId - this.width * 2 + 1 === targetId ||
                    startId - this.width * 2 - 1 === targetId ||
                    startId - this.width - 2 === targetId ||
                    startId - this.width + 2 === targetId
                ) {
                    return true;
                }
                break;
            case 'bishop':
                    if(
                        startId + this.width + 1 === targetId ||
                        startId + this.width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild ||
                        startId + this.width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild ||
                        startId + this.width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild||
                        startId + this.width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 + 4}"]`).firstChild ||
                        startId + this.width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 + 5}"]`).firstChild || 
                        startId + this.width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 6 + 6}"]`).firstChild ||
        
                        startId - this.width - 1 === targetId ||
                        startId - this.width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild ||
                        startId - this.width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild ||
                        startId - this.width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild||
                        startId - this.width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 - 4}"]`).firstChild ||
                        startId - this.width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 - 5}"]`).firstChild || 
                        startId - this.width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 6 - 6}"]`).firstChild ||
                    
                        startId - this.width + 1 === targetId ||
                        startId - this.width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild ||
                        startId - this.width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild ||
                        startId - this.width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild||
                        startId - this.width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 + 4}"]`).firstChild ||
                        startId - this.width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 + 5}"]`).firstChild || 
                        startId - this.width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 6 + 6}"]`).firstChild ||
                        
                        startId + this.width - 1 === targetId ||
                        startId + this.width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild ||
                        startId + this.width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild ||
                        startId + this.width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild||
                        startId + this.width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 - 4}"]`).firstChild ||
                        startId + this.width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 - 5}"]`).firstChild || 
                        startId + this.width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 6 - 6}"]`).firstChild
                    ) { return true }
                    break      
            case 'rook':
                    if(
                        startId + this.width === targetId ||
                        startId + this.width * 2 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild ||
                        startId + this.width * 3 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild ||
                        startId + this.width * 4 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild ||
                        startId + this.width * 5 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4}"]`).firstChild ||
                        startId + this.width * 6 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5}"]`).firstChild ||
                        startId + this.width * 7 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 6}"]`).firstChild ||
        
                        startId - this.width === targetId ||
                        startId - this.width * 2 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild ||
                        startId - this.width * 3 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild ||
                        startId - this.width * 4 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild ||
                        startId - this.width * 5 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4}"]`).firstChild ||
                        startId - this.width * 6 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5}"]`).firstChild ||
                        startId - this.width * 7 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 6}"]`).firstChild ||
        
                        startId + 1 === targetId ||
                        startId + 2 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild ||
                        startId + 3 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild ||
                        startId + 4 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild ||
                        startId + 5 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild ||
                        startId + 6 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild ||
                        startId + 7 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + 6}"]`).firstChild ||
        
                        startId - 1 === targetId ||
                        startId - 2 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild ||
                        startId - 3 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild ||
                        startId - 4 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild ||
                        startId - 5 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild ||
                        startId - 6 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild ||
                        startId - 7 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - 6}"]`).firstChild
                    ) { return true }
                    break
            case 'queen':
                    if(
                        startId + this.width + 1 === targetId ||
                        startId + this.width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild ||
                        startId + this.width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild ||
                        startId + this.width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild||
                        startId + this.width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 + 4}"]`).firstChild ||
                        startId + this.width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 + 5}"]`).firstChild || 
                        startId + this.width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId + this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 + 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId + this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 6 + 6}"]`).firstChild ||
        
                        startId - this.width - 1 === targetId ||
                        startId - this.width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild ||
                        startId - this.width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild ||
                        startId - this.width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild||
                        startId - this.width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 - 4}"]`).firstChild ||
                        startId - this.width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 - 5}"]`).firstChild || 
                        startId - this.width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId - this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 - 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId - this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 6 - 6}"]`).firstChild ||
                    
                        startId - this.width + 1 === targetId ||
                        startId - this.width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild ||
                        startId - this.width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild ||
                        startId - this.width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild||
                        startId - this.width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 + 4}"]`).firstChild ||
                        startId - this.width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 + 5}"]`).firstChild || 
                        startId - this.width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId - this.width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2 + 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId - this.width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 6 + 6}"]`).firstChild ||
                        
                        startId + this.width - 1 === targetId ||
                        startId + this.width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild ||
                        startId + this.width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild ||
                        startId + this.width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild||
                        startId + this.width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 - 4}"]`).firstChild ||
                        startId + this.width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 - 5}"]`).firstChild || 
                        startId + this.width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId + this.width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2 - 2}"]`).firstChild&& !document.querySelector(`[square-id="${startId + this.width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 6 - 6}"]`).firstChild ||
                    
                        startId + this.width === targetId ||
                        startId + this.width * 2 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild ||
                        startId + this.width * 3 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild ||
                        startId + this.width * 4 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild ||
                        startId + this.width * 5 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4}"]`).firstChild ||
                        startId + this.width * 6 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5}"]`).firstChild ||
                        startId + this.width * 7 === targetId && !document.querySelector(`[square-id="${startId + this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + this.width * 6}"]`).firstChild ||
        
                        startId - this.width === targetId ||
                        startId - this.width * 2 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild ||
                        startId - this.width * 3 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild ||
                        startId - this.width * 4 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild ||
                        startId - this.width * 5 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4}"]`).firstChild ||
                        startId - this.width * 6 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5}"]`).firstChild ||
                        startId - this.width * 7 === targetId && !document.querySelector(`[square-id="${startId - this.width}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - this.width * 6}"]`).firstChild ||
        
                        startId + 1 === targetId ||
                        startId + 2 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild ||
                        startId + 3 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild ||
                        startId + 4 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild ||
                        startId + 5 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild ||
                        startId + 6 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild ||
                        startId + 7 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + 6}"]`).firstChild ||
        
                        startId - 1 === targetId ||
                        startId - 2 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild ||
                        startId - 3 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild ||
                        startId - 4 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild ||
                        startId - 5 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild ||
                        startId - 6 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild ||
                        startId - 7 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - 6}"]`).firstChild
                    
                    ){return true}
                    break
            case 'king':
                    if(
                        startId + 1 === targetId ||
                        startId - 1 === targetId ||
                        startId + this.width === targetId ||
                        startId - this.width === targetId ||
                        startId + this.width - 1 === targetId ||
                        startId + this.width + 1 === targetId ||
                        startId - this.width - 1 === targetId ||
                        startId - this.width + 1 === targetId
                    ) {return true}
                    break
            default:
                break;
        }

        return false;
    }
}

const chessGame = new ChessGame();


