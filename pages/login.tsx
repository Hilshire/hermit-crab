import { useSnackbar } from '@hooks';
import { FormControl, TextField, Button } from '@material-ui/core';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { hash } from 'bcrypt'

export default function login() {
  const [claim, setClaim] = useState('')
  const { setSnackbar, Snackbar } = useSnackbar()

  const router =  useRouter()

  return <> 
    <form>
      <FormControl fullWidth>
        <TextField id="claim" label="claim" multiline value={claim} onChange={(e) => setClaim(e.target.value)} />
      </FormControl>
      <FormControl>
        <Button color="primary" onClick={submit}>submit</Button>
      </FormControl>
    </form>
    <Snackbar></Snackbar>
  </>

  function submit() {
    axios.post('/api/login', { claim }).then(res => {
      if (res.status === 401) {
        setSnackbar(true, 'authentication fail', 'error')
      } else if (res.data.code) {
        setSnackbar(true, 'authentication success', 'success', () => {
          const url = new window.URL(location.href)
          if (url.searchParams.has('target')) {
            location.href=`${url.origin}${url.searchParams.get('target')}`
          } else {
            location.href=`${url.origin}/manage`
          }
        })
      }
    })
  }
}