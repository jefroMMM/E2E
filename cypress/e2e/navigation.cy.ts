describe('Navegación y recuperación', () => {
  it('regresa del detalle a los resultados de búsqueda', () => {
    cy.visitDex('/?q=pikachu')
    cy.findByRole('link', { name: 'Pikachu, no. 0025' }).click()
    cy.location('pathname').should('eq', '/pokemon/pikachu')

    cy.go('back')

    cy.location('pathname').should('eq', '/')
    cy.location('search').should('eq', '?q=pikachu')
    cy.findByRole('searchbox', { name: 'Search Pokémon by name' }).should('have.value', 'pikachu')
    cy.findSpecimens().first().should('have.attr', 'aria-label', 'Pikachu, no. 0025')
    cy.findSpecimens().each(($link) => expect($link.attr('href')).to.include('pikachu'))
  })

  it('permite recuperar la búsqueda vacía dentro de un tipo', () => {
    cy.visitDex('/type/water?q=pikachu')
    cy.findByText('No specimen is named “pikachu”.').should('be.visible')

    cy.findByRole('button', { name: 'Clear search' }).click()

    cy.location('pathname').should('eq', '/type/water')
    cy.location('search').should('be.empty')
    cy.findByRole('heading', { level: 1, name: 'Water' }).should('be.visible')
    cy.findByRole('link', { name: 'Squirtle, no. 0007' }).should('be.visible')
  })

  it('conserva el detalle si falla la imagen', () => {
    cy.visitDex('/pokemon/pikachu')
    // A unique URL avoids the artwork cached by earlier visits and fires the
    // network error after React has attached its image error handler.
    cy.intercept('GET', '**/official-artwork/25.png?e2e=missing', { statusCode: 404, body: '' }).as('missingArtwork')
    cy.findByRole('img', { name: 'Official artwork of Pikachu' })
      .invoke('attr', 'src')
      .then((src) => {
        cy.findByRole('img', { name: 'Official artwork of Pikachu' })
          .invoke('attr', 'src', `${src}?e2e=missing`)
      })
    cy.wait('@missingArtwork')

    cy.findByText('No artwork on file').should('be.visible')
    cy.findByRole('heading', { level: 1, name: 'Pikachu' }).should('be.visible')
    cy.findByRole('article').within(() => {
      cy.contains('dt', /^Total$/).next('dd').should('have.text', '320')
    })
  })
})
