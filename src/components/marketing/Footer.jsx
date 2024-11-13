const Footer = () => {
  return (
    <footer className="bg-content2 w-full px-4 py-16">
      <h5 className="font-medium text-center">
        {new Date().getFullYear()} &copy;{' '}
        <span className="text-secondary">Mailerfuse</span>
      </h5>
    </footer>
  )
}

export default Footer
