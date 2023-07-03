'use client';

import { useEffect, useRef, useState } from "react";

interface spinnerItem {
    text: string;
    color: string;
}

const Spinner = () => {
    const itemsRef = useRef<spinnerItem[]>([]);
    // const [items, setItems] = useState<spinnerItem[]>([...itemsRef.current]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [angle, setAngle] = useState(0);
    const angleRef = useRef(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [sliceAngle, setSliceAngle] = useState(0);
    const [eliminationMode, setEliminationMode] = useState(false);
    const itemInputRef = useRef<HTMLInputElement>(null);
    const [winnerMessage, setWinnerMessage] = useState("");
    const spinTimeoutRef = useRef<number | null>(null);
    const drawSpinnerRef = useRef<() => void>(() => { });
    
    const arrowSize = 20;
    const arrowAngle = Math.PI / 6; // 30 degrees

 

const drawSpinner = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const items = itemsRef.current;
            setSliceAngle((2 * Math.PI) / items.length);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < items.length; i++) {
                const startAngle = (i * sliceAngle) - angleRef.current;
                const endAngle = ((i + 1) * sliceAngle) - angleRef.current;

                const gradient = ctx.createRadialGradient(
                    canvas.width / 2,
                    canvas.height / 2,
                    0,
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2 - 20
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, items[i].color);

                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2);
                ctx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2 - 20,
                    startAngle,
                    endAngle
                );
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#000';
                ctx.stroke();

                const textAngle = startAngle + (sliceAngle / 2);
                const textRadius = canvas.width / 2 - 40;
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(textAngle);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#000';
                ctx.fillText(items[i].text, textRadius / 2, 0);
                ctx.restore();
            }
            drawArrow(ctx);
        }
    }
};
 
drawSpinnerRef.current = drawSpinner;
 
    useEffect(() => {
            drawSpinner()
    }, [angleRef.current, itemsRef.current, sliceAngle]);

    function drawArrow(context: CanvasRenderingContext2D) {
        if (itemsRef.current.length <= 0) return;
        const centerX = canvasRef.current!.width / 2;
        const centerY = canvasRef.current!.height / 2;
        const arrowOffset = centerX - arrowSize;
        const arrowX = centerX + arrowOffset;
        const arrowY = centerY;

        context.beginPath();
        context.moveTo(arrowX, arrowY);
        context.lineTo(arrowX + Math.cos(-arrowAngle) * arrowSize, arrowY + Math.sin(-arrowAngle) * arrowSize);
        context.lineTo(arrowX + Math.cos(0) * (arrowSize + arrowSize), arrowY + Math.sin(0) * (arrowSize + arrowSize));
        context.lineTo(arrowX + Math.cos(arrowAngle) * arrowSize, arrowY + Math.sin(arrowAngle) * arrowSize);
        context.closePath();
        context.fillStyle = '#000';
        context.fill();
    }

    function spinWheel() {
        const items = itemsRef.current
        if (items.length === 0) {
            alert('Please add items to the spinner wheel.');
            return;
        }
        setWinnerMessage("");
        if (isSpinning) {
            return;
        }
        const drawSpinner = drawSpinnerRef.current;


        setIsSpinning(true);
        const spinDuration = 3000;
        const spinAngle = Math.random() * 10 + 10;
        const spinCount = Math.floor(Math.random() * 5) + 3;

        const startAngle = angleRef.current;
        const totalSpinAngle = spinAngle * spinCount;

        const startTime = Date.now();
        const endTime = startTime + spinDuration;

        function animate() {
            const currentTime = Date.now();

            if (currentTime >= endTime) {
                clearTimeout(spinTimeoutRef.current!);
                setIsSpinning(false);
                const normalizedAngle = normalizeAngle(startAngle + totalSpinAngle);
                const sliceIndex = Math.floor((normalizedAngle / sliceAngle) % items.length); 
                const selectedItem = items[sliceIndex].text;

                if (eliminationMode) {
                    const tempItems = [...itemsRef.current];
                    if (tempItems.length > 1) {
                        tempItems.splice(sliceIndex, 1);
                        const newSliceAngle = (2 * Math.PI) / tempItems.length;
                        setSliceAngle(newSliceAngle);
                        itemsRef.current = tempItems;
                        continueSpinning();
                    } else {
                        setWinnerMessage(selectedItem);
                        alert('Winner is: ' + selectedItem);
                    }
                } else {
                    setWinnerMessage(selectedItem);
                }
                drawSpinnerRef.current();

                return;
            } else {

                const elapsedTime = currentTime - startTime;
                const progress = elapsedTime / spinDuration;
                const easingProgress = easeOutExpo(progress);
                // setAngle(startAngle + easingProgress * totalSpinAngle);
                angleRef.current = startAngle + easingProgress * totalSpinAngle;
                drawSpinner();

                spinTimeoutRef.current = window.setTimeout(animate, 5);
            }

        }



        animate();
    }
    function continueSpinning( ) {
        setTimeout(() => {
            spinWheel( );
        }, 2000);
    }



    function addItem() {
        const inputBox = itemInputRef.current!;
        const newItem = inputBox.value.trim();

        if (newItem !== '') {
            const color = getRandomColor();
            const tempArray = [...itemsRef.current];
            tempArray.push({ text: newItem, color: color });
            const newSliceAngle = (2 * Math.PI) / tempArray.length;
            setSliceAngle(newSliceAngle);
           itemsRef.current = tempArray

            inputBox.value = '';
        }
    }

    function resetWheel() {
        const canvas = canvasRef.current;

        if (canvas) {
            const ctx = canvas.getContext("2d");

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        clearTimeout(spinTimeoutRef.current!);
        itemsRef.current = [];
        // setAngle(0);
        angleRef.current = 0 ;
        setIsSpinning(false);
        setEliminationMode(false);
        setWinnerMessage("");
    }

    // Utility functions
    function normalizeAngle(angle: number) {
        const twoPi = 2 * Math.PI;
        return ((angle % twoPi) + twoPi) % twoPi;
    }

    function easeOutExpo(t: number) {
        return 1 - Math.pow(2, -10 * t);
    }

    function getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 10 + 60);
        const lightness = Math.floor(Math.random() * 10 + 70);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    return (
        <>
            <div className="main-container">
                <h1>Spinner Wheel</h1>
                <div className="input-container">
                    <input
                        ref={itemInputRef}
                        type="text"
                        id="inputBox"
                        placeholder="Enter item"
                        onKeyDown={(e) => {
                            if (e.keyCode === 13) {
                                addItem();
                            }
                        }}
                    />
                    <button onClick={addItem}>Add Item</button>
                </div>
                <div className="input-container">
                    <input type="number" id="minNumberInput" placeholder="Min" />
                    <input type="number" id="maxNumberInput" placeholder="Max" />
                    <button >Add Number Range</button>
                </div>
                <div className="button-container">
                    {/* <button onClick={spinWheel}>Spin</button> */}
                    {/* <button onClick={resetWheel}>Reset</button> */}
                    <button disabled={isSpinning} onClick={spinWheel as any} className="px-4 py-2 text-base bg-green-500 rounded-md cursor-pointer mr-4 disabled:bg-green-400 disabled:text-white disabled:cursor-wait">Spin</button>
                    <button disabled={isSpinning} onClick={resetWheel} className="px-4 py-2 text-base bg-green-500 rounded-md cursor-pointer mr-4 disabled:bg-green-400 disabled:text-white disabled:cursor-wait">Reset</button>

                </div>
                <div className="elimination-mode">
                    <input
                        type="checkbox"
                        id="eliminationMode"
                        checked={eliminationMode}
                        onChange={(e) => setEliminationMode(e.target.checked)}
                    />
                    <label htmlFor="eliminationMode">Elimination Mode</label>
                </div>
                <canvas id="canvas" ref={canvasRef} width={400} height={400}></canvas>
                <p className="winner-message" id="winnerMessage">{winnerMessage}</p>
            </div>
        </>
    );
}

export default Spinner;
