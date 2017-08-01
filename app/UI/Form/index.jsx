import { h } from 'preact'
import { Wrapper, Textarea, Action } from './style.css'
import { Button } from '../_lib/Button.css'
import { Spinner } from '../_lib/Spinner.css'

export default function Form ({ onChange, onSubmit, text, autoFocus = true }) {
  return (
    <Wrapper
      tag='form'
      action='#'
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Textarea
        tag='textarea'
        autoFocus={autoFocus}
        value={text}
        onInput={({ target: { value } }) => onChange(value)}
        ref={({ base }) => {
          if (!autoFocus || this.selectedOnce) return
          this.selectedOnce = true
          base.select()
        }}
        placeholder="What's happening?"
      />

      <Action>
        <Button tag='button' type='submit' fullWidth disabled={text.trim() === ''}>
          Publish
        </Button>
      </Action>
    </Wrapper>
  )
}
