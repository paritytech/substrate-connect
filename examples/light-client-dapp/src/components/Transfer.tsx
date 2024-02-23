export const Transfer = () => {
  // TODO: handle form fields and submission with react
  // TODO: fetch accounts from extension
  // TODO: fetch selected account balance
  // TODO: validate destination address
  // TODO: use PAPI to encode the transaction calldata
  // TODO: transfer should trigger an extension popup that signs the transaction
  // TODO: extract transaction submission into a hook
  // TODO: follow transaction submission events until it is finalized
  return (
    <article>
      <header>Transfer funds</header>
      <form>
        <select>
          <option disabled selected>
            Select Account...
          </option>
          <option>Account 1</option>
          <option>Account 2</option>
        </select>
        <small>Balance: 123456789</small>
        <input placeholder="to"></input>
        <input type="number" placeholder="amount"></input>
        <footer>
          <button>Transfer</button>
        </footer>
      </form>
    </article>
  )
}
