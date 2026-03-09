import React from 'react';
import { motion } from 'framer-motion';
import './Skeleton.css';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => {
    return (
        <div
            className={`skeleton-base ${className}`}
            style={{ width, height, borderRadius }}
        >
            <motion.div
                className="skeleton-shimmer"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'linear'
                }}
            />
        </div>
    );
};

export default Skeleton;
