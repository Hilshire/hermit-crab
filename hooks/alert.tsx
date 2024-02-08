import React, { useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent,
} from '@material-ui/core';

export function useAlert(onOk, onClose = () => { }) {
  const [visible, setVisible] = useState<boolean>(false);
  const [handleClose, setHandleClose] = useState<() => () => void>(() => onClose);
  // useState 如果传的是 function 会调用一次h，用来获得初始 state。所以这里再包一层
  const [handleOk, setHandleOk] = useState<() => () => void>(() => onOk);

  return {
    visible,
    setVisible,
    setHandleClose,
    setHandleOk,
    Alert: ({ children }) => (
      <Dialog open={visible} onClose={handleClose}>
        <DialogContent>
          {children}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleOk}>
            Ok
          </Button>
          <Button color="default" autoFocus onClick={() => setVisible(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    ),
  };
}
