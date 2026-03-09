import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRocket, FaUserEdit, FaCompass, FaCheck } from 'react-icons/fa';
import HallwayLogo from './HallwayLogo';
import './Onboarding.css';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('onboarding_complete');
        if (!hasSeenOnboarding) {
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const finish = () => {
        localStorage.setItem('onboarding_complete', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="onboarding-overlay">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={step}
                    className="onboarding-card card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    {step === 1 && (
                        <div className="onboarding-step">
                            <div className="step-icon"><FaRocket /></div>
                            <h2>Welcome to HallWay!</h2>
                            <p>Step into your new community. HallWay is where students connect, share, and grow together.</p>
                            <button className="primary-btn" onClick={() => setStep(2)}>Let's Go!</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="onboarding-step">
                            <div className="step-icon"><FaUserEdit /></div>
                            <h2>Identify Yourself</h2>
                            <p>Go to your Profile to set your display name and bio. Let others know who you are!</p>
                            <button className="primary-btn" onClick={() => setStep(3)}>Got it!</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="onboarding-step">
                            <div className="step-icon"><FaCompass /></div>
                            <h2>Explore & Join</h2>
                            <p>Browse through academic and social boards. Join the ones that match your interests!</p>
                            <button className="primary-btn" onClick={finish}>Start Exploring <FaCheck /></button>
                        </div>
                    )}

                    <div className="step-dots">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`dot ${step === i ? 'active' : ''}`} />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
