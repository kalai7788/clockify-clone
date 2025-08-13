// src/components/LoadingSpinner.jsx
import styled, { keyframes } from 'styled-components';

// Use transient props ($ prefix) to prevent DOM warnings
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: inline-block;
  position: relative;
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
`;

const SpinnerInner = styled.div`
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: ${props => props.$size || '32px'};
  height: ${props => props.$size || '32px'};
  margin: ${props => props.$margin || '4px'};
  border: ${props => props.$thickness || '4px'} solid ${props => props.$color || '#3498db'};
  border-radius: 50%;
  animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: ${props => props.$color || '#3498db'} transparent transparent transparent;
`;

export default function LoadingSpinner({ 
  size = '40px',
  color = '#3498db',
  thickness = '4px',
  margin = '4px',
  className 
}) {
  return (
    <SpinnerContainer 
      className={className}
      $size={size}
      aria-label="loading"
      role="status"
    >
      <SpinnerInner 
        $size={size} 
        $color={color} 
        $thickness={thickness}
        $margin={margin}
      />
    </SpinnerContainer>
  );
}
