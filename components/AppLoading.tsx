import { useState } from 'react';
import { LinearProgress } from '@material-ui/core';
import { useRouteChange } from '@hooks';

export function AppLoading(props = {}) {
  const [showLoading, setShowLoading] = useState(false);

  useRouteChange(
    () => setShowLoading(true),
    () => setShowLoading(false),
  );

  return showLoading ? <LinearProgress {...props} /> : null;
}
