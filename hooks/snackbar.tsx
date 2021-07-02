import { useState } from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert, Color } from '@material-ui/lab';

export function useSnackbar(type: Color = 'success') {
  const [visible, setVisible] = useState<boolean>(false);
  const [severity, setSeverity] = useState<Color>(type);
  const [context, setContext] = useState<string>('');
  const [cb, setCb] = useState<()=>void>(() => {});

  return {
    visible,
    severity,
    setVisible,
    setSeverity,
    setContext,
    setSnackbar: (visible?, context?, severity?: Color, cb?: ()=>void) => {
      visible && setVisible(visible);
      severity && setSeverity(severity);
      context && setContext(context);
      cb && setCb(cb);
    },
    Snackbar: () => (
      <Snackbar open={visible} autoHideDuration={3000} onClose={cb}>
        <Alert severity={severity}>{context}</Alert>
      </Snackbar>
    ),
  };
}
