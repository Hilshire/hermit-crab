import { useSnackbar } from '@hooks';
import { FormControl, TextField, Button } from '@material-ui/core';
import axios from 'axios';
import { useState } from 'react';

export default function Login() {
  const [claim, setClaim] = useState('');
  const { setSnackbar, Snackbar } = useSnackbar();

  return (
    <>
      <form>
        <FormControl fullWidth>
          <TextField id="claim" label="claim" multiline value={claim} onChange={(e) => setClaim(e.target.value)} />
        </FormControl>
        <FormControl>
          <Button color="primary" onClick={submit}>submit</Button>
        </FormControl>
      </form>
      <Snackbar />
    </>
  );

  function submit() {
    axios.post('/api/login', { claim }).then((res) => {
      if (res.status === 401) {
        setSnackbar(true, 'authentication fail', 'error');
      } else if (res.data.code) {
        setSnackbar(true, 'authentication success', 'success', () => {
          const url = new window.URL(location.href);
          location.href = getSafeTarget(url.searchParams.get('target'));
        });
      }
    }, (e) => {
      setSnackbar(true, e.response?.status === 401 ? 'authentication fail' : 'login failed', 'error');
    });
  }

  function getSafeTarget(target: string | null) {
    if (!target || !target.startsWith('/') || target.startsWith('//')) {
      return '/manage/blog';
    }

    const targetUrl = new window.URL(target, window.location.origin);
    return targetUrl.origin === window.location.origin
      ? `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
      : '/manage/blog';
  }
}
