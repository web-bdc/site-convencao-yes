"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
    targetDate: string; // ISO format: YYYY-MM-DDTHH:mm:ss
}

export default function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const target = new Date(targetDate).getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) {
        return null; // Avoid hydration mismatch or flash
    }

    // Se o tempo acabou
    if (
        timeLeft.days === 0 &&
        timeLeft.hours === 0 &&
        timeLeft.minutes === 0 &&
        timeLeft.seconds === 0
    ) {
        return null;
    }

    return (
        <div style={{
            display: "none",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem 1rem",
            background: "linear-gradient(to right, #e11d48, #be123c)",
            color: "white",
            borderRadius: "12px",
            margin: "0 auto 2rem auto",
            maxWidth: "800px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }}>
            <TimeBox value={timeLeft.days} label="DIAS" />
            <TimeBox value={timeLeft.hours} label="HORAS" />
            <TimeBox value={timeLeft.minutes} label="MIN" />
            <TimeBox value={timeLeft.seconds} label="SEG" />
        </div>
    );
}

function TimeBox({ value, label }: { value: number; label: string }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "70px"
        }}>
            <span style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                lineHeight: "1"
            }}>
                {String(value).padStart(2, '0')}
            </span>
            <span style={{
                fontSize: "0.75rem",
                opacity: 0.9,
                marginTop: "4px"
            }}>
                {label}
            </span>
        </div>
    );
}
