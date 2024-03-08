import Venta from '../../../../src/index.tsx';

export const Button = ({ children, ...rest }) => {
  return (
    <button {...rest} style="background-color: #4CAF50; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border: none; border-radius: 8px;">
      {children}
    </button>
  )
}
