import {
  FunctionComponent,
  ChangeEvent,
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  memo,
} from "react"

import { FormControl, TextField, Box } from "@material-ui/core"
import Skeleton from "@material-ui/lab/Skeleton"

import Identicon from "@polkadot/react-identicon"

interface Props {
  setAddress: Dispatch<SetStateAction<string>>
}

const InputAddress: FunctionComponent<Props> = ({ setAddress }) => {
  const [value, setValue] = useState<string>("")

  useEffect((): void => {
    setAddress(value)
  }, [value, setAddress])

  const handleChangeButton = (e: ChangeEvent) => {
    const val = (e.currentTarget as HTMLTextAreaElement).value
    setValue(val)
  }

  return (
    <>
      <Box marginY={1}>
        <FormControl required fullWidth>
          <TextField
            label="Receiver"
            onChange={handleChangeButton}
            onFocus={handleChangeButton}
            onBlur={handleChangeButton}
            value={value}
            placeholder="Westend Address"
            variant="outlined"
            fullWidth
            InputProps={{
              spellCheck: "false",
              startAdornment: (
                <Box marginRight={1}>
                  {!value || value === "" ? (
                    <Skeleton variant="circle" width={32} height={32} />
                  ) : (
                    <Identicon size={32} theme="polkadot" value={value} />
                  )}
                </Box>
              ),
            }}
          />
        </FormControl>
      </Box>
    </>
  )
}

export default memo(InputAddress)
