import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import type ICoord from '../services/coordinate.service'

// Catppuccin Macchiato accent colors
const SPHERE_COLORS = [
  0xc6a0f6, // mauve
  0x8aadf4, // blue
  0x8bd5ca, // teal
  0xa6da95, // green
  0xeed49f, // yellow
  0xf5a97f, // peach
  0xf5bde6, // pink
  0xed8796, // red
  0xb7bdf8, // lavender
  0x91d7e3, // sky
]

export interface ThreeViewHandle {
  updateTargetPosition: (coords: ICoord[]) => void
}

const ThreeView = forwardRef<ThreeViewHandle, {}>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const globalScene = useRef<THREE.Scene | null>(null)
  const locations = useRef<THREE.Mesh[]>([])

  useImperativeHandle(ref, () => ({
    updateTargetPosition(coords) {
      removeLocations()

      coords.forEach((c, i) => {
        newLocation(c, i)
      })
    }
  }))

  const removeLocations = () => {
  locations.current.forEach(e => {
    globalScene.current?.remove(e)
  })
  locations.current = []
}

const newLocation = (coord: ICoord, index: number) => {
  const color = SPHERE_COLORS[index % SPHERE_COLORS.length]
  const sphereGeo = new THREE.SphereGeometry(0.03)
  const sphere = new THREE.Mesh(
    sphereGeo,
    new THREE.MeshBasicMaterial({ color })
  )
  sphere.position.set(coord.x, coord.y, coord.z)
  globalScene.current?.add(sphere)
  locations.current.push(sphere)
}

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x24273a) // macchiato: base
    globalScene.current = scene

    const aspect = container.clientWidth / container.clientHeight
    const s = 1
    const camera = new THREE.OrthographicCamera(-s * aspect, s * aspect, s, -s, 0.1, 1000)
    camera.position.set(3, 2.5, 2.5)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0.5, 0.5, 0.5)
    controls.enableZoom = false
    controls.maxPolarAngle = 1.2
    controls.minPolarAngle = 1.2
    controls.enableDamping = true

    //CUBE
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1)
    const cubeEdges = new THREE.EdgesGeometry(cubeGeo)
    const cube = new THREE.LineSegments(
      cubeEdges,
      new THREE.LineBasicMaterial({ color: 0x5b6078, linewidth: 3 }) // macchiato: surface2
    )
    //Align corner to 0,0,0
    cube.translateX(0.5)
    cube.translateY(0.5)
    cube.translateZ(0.5)
    scene.add(cube)

    //animate
    let animationId: number
    const render = () => {
      animationId = requestAnimationFrame(render)
      controls.update()
      renderer.render(scene, camera)
    }
    render()

    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      const newAspect = width / height
      renderer.setSize(width, height)
      camera.left = -s * newAspect
      camera.right = s * newAspect
      camera.top = s
      camera.bottom = -s
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      controls.dispose()
      renderer.dispose()
      cubeGeo.dispose()
      cube.material.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  )
})

export default ThreeView