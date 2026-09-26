export function SupportContacts() {
  return (
    <ul className="contacts" role="list">
      <li>
        <a className="contact" href="tel:112">
          <span className="contact__number">112</span>
          <span className="contact__label">Emergência, se estás em perigo imediato</span>
        </a>
      </li>
      <li>
        <a className="contact" href="tel:808242424">
          <span className="contact__number">SNS 24 · 808 24 24 24</span>
          <span className="contact__label">Orientação de saúde, 24 horas por dia</span>
        </a>
      </li>
      <li className="contact contact--plain">
        <span className="contact__label">
          Liga ou escreve a alguém de confiança e diz-lhe que não queres estar sozinho/a com isto agora.
        </span>
      </li>
    </ul>
  )
}
