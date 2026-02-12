export const automationNodeStyles = {
  node: (color: string) => `
    min-width: 180px;
    background: #18181b;
    border: 2px solid ${color};
    border-radius: 8px;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
    }
  `,
  header: `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  `,
  icon: (_icon: string) => `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: inherit;
    opacity: 0.8;
  `,
  label: `
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #a1a1aa;
  `,
  body: `
    padding: 12px;
  `,
  title: `
    font-size: 14px;
    font-weight: 500;
    color: #f4f4f5;
    margin-bottom: 4px;
  `,
  description: `
    font-size: 12px;
    color: #71717a;
    line-height: 1.4;
  `,
  handleInput: (color: string) => `
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    background: ${color};
    border-radius: 50%;
    border: 2px solid #18181b;
    
    &:hover {
      transform: translateY(-50%) scale(1.2);
    }
  `,
  handleOutput: (color: string) => `
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    background: ${color};
    border-radius: 50%;
    border: 2px solid #18181b;
    
    &:hover {
      transform: translateY(-50%) scale(1.2);
    }
  `,
};

export const automationEdgeStyles = {
  edge: `
    stroke: #6366f1;
    stroke-width: 2;
  `,
};

export const canvasStyles = {
  container: `
    width: 100%;
    height: 500px;
    background: #09090b;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  `,
  reactFlow: `
    background: #09090b;
  `,
  controls: `
    position: absolute;
    bottom: 16px;
    left: 16px;
    
    button {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #a1a1aa;
      
      &:hover {
        background: #3f3f46;
        color: #f4f4f5;
      }
    }
  `,
  minimap: `
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    overflow: hidden;
  `,
  panel: `
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  `,
  panelTitle: `
    font-size: 14px;
    font-weight: 600;
    color: #f4f4f5;
    margin-bottom: 4px;
  `,
  panelHint: `
    font-size: 12px;
    color: #71717a;
  `,
};

export const propertiesStyles = {
  container: `
    position: absolute;
    top: 16px;
    right: 16px;
    width: 320px;
    max-height: calc(100% - 32px);
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 100;
  `,
  header: `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #3f3f46;
  `,
  title: `
    font-size: 14px;
    font-weight: 600;
    color: #f4f4f5;
  `,
  closeBtn: `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    color: #71717a;
    cursor: pointer;
    border-radius: 4px;
    
    &:hover {
      background: #3f3f46;
      color: #f4f4f5;
    }
  `,
  content: `
    padding: 16px;
    overflow-y: auto;
    flex: 1;
  `,
  formGroup: `
    margin-bottom: 16px;
  `,
  label: `
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #a1a1aa;
    margin-bottom: 6px;
  `,
  input: `
    width: 100%;
    padding: 10px 12px;
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    font-size: 14px;
    color: #f4f4f5;
    outline: none;
    transition: all 0.2s ease;
    
    &::placeholder {
      color: #52525b;
    }
    
    &:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
  `,
  textarea: `
    width: 100%;
    padding: 10px 12px;
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    font-size: 14px;
    color: #f4f4f5;
    outline: none;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    
    &:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
  `,
  select: `
    width: 100%;
    padding: 10px 12px;
    background: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    font-size: 14px;
    color: #f4f4f5;
    outline: none;
    cursor: pointer;
    
    &:focus {
      border-color: #6366f1;
    }
  `,
  empty: `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #52525b;
    font-size: 14px;
  `,
  emptyIcon: `
    margin-bottom: 8px;
    opacity: 0.5;
  `,
};
