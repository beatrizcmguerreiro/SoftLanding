export function SupportContacts() {
  return (
    <ul className="contacts" role="list">
      <li>
        <a className="contact" href="tel:112">
          <span className="contact__number">112</span>
          <span className="contact__label">Emergency, if you are in immediate danger</span>
        </a>
      </li>
      <li>
        <a className="contact" href="tel:808242424">
          <span className="contact__number">SNS 24 · 808 24 24 24</span>
          <span className="contact__label">Health guidance in Portugal, 24 hours a day</span>
        </a>
      </li>
      <li className="contact contact--plain">
        <span className="contact__label">
          Call or message someone you trust and tell them you don’t want to be alone with this right now.
        </span>
      </li>
    </ul>
  )
}
