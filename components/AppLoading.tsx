import { useState } from 'react';
import { LinearProgress } from '@material-ui/core';
import { useRouteChange } from '@hooks';

export function AppLoading(props = {}) {
  const [showLoading, setShowLoading] = useState(false);

  useRouteChange(
    () => { setShowLoading(true); console.log('start', showLoading); },
    () => { setShowLoading(false); console.log('end', showLoading); },
  );

  return showLoading ? <LinearProgress {...props} /> : null;
}
