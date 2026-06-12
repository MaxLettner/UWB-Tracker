import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import type ICoord from '../services/coordinate.service'

//catppuccin macchiato accent colors
const SPHERE_COLORS = [
  0xc6a0f6,// mauve
  0xeed49f,// yellow
  0xed8796,// red
  0x8bd5ca,// teal
  0xa6da95,// green
  0x8aadf4,// blue
  0xf5a97f,// peach
  0x91d7e3,// sky
  0xf5bde6,// pink
  0xb7bdf8,// lavender
]

export interface ThreeViewHandle {
  updateTargetPosition: (coords: ICoord[]) => void
}

interface LocationEntry {
  sphere: THREE.Mesh
  lines: THREE.Line[]
  lineEnds: THREE.Mesh[]
}

const ThreeView = forwardRef<ThreeViewHandle, {}>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const globalScene = useRef<THREE.Scene | null>(null)
  const locations = useRef<LocationEntry[]>([])

  useImperativeHandle(ref, () => ({
    //exposes updateTargetPositon to App.tsx
    updateTargetPosition(coords) {
      removeLocations()
      coords.forEach((c, i) => {
        newLocation(c, i)
      })
    }
  }))

  const removeLocations = () => {
    //removes every location and disposes every geometry and material
    locations.current.forEach(({ sphere, lines, lineEnds }) => {
      globalScene.current?.remove(sphere)
      sphere.geometry.dispose()
        ; (sphere.material as THREE.Material).dispose()

      lines.forEach(line => {
        globalScene.current?.remove(line)
        line.geometry.dispose()
          ; (line.material as THREE.Material).dispose()
      })

      lineEnds.forEach(end => {
        globalScene.current?.remove(end)
        end.geometry.dispose()
          ; (end.material as THREE.Material).dispose()
      })
    })
    locations.current = []
  }

  const newLocation = (coord: ICoord, index: number) => {
    const color = SPHERE_COLORS[index % SPHERE_COLORS.length]
    const { x, y, z } = coord

    //SPHERE
    const sphereGeo = new THREE.SphereGeometry(0.03)
    const sphere = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color })
    )
    sphere.position.set(x, y, z)
    globalScene.current?.add(sphere)

    //LINES
    const lineMaterial = () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
      })

    //ENDS
    const endGeo = new THREE.SphereGeometry(0.01)
    const endMaterial = new THREE.MeshBasicMaterial({ color })

    //line to x=0 wall
    const lineX = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(0, y, z),
      ]),
      lineMaterial()
    )
    const endX = new THREE.Mesh(endGeo, endMaterial)
    endX.position.set(0, y, z)

    //line to y=0 wall
    const lineY = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, 0, z),
      ]),
      lineMaterial()
    )
    const endY = new THREE.Mesh(endGeo, endMaterial)
    endY.position.set(x, 0, z)

    //line to z=0 wall
    const lineZ = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, y, 0),
      ]),
      lineMaterial()
    )
    const endZ = new THREE.Mesh(endGeo, endMaterial)
    endZ.position.set(x, y, 0)

    const lines = [lineX, lineY, lineZ]
    lines.forEach(l => globalScene.current?.add(l))

    const lineEnds = [endX, endY, endZ]
    lineEnds.forEach(e => globalScene.current?.add(e))

    locations.current.push({ sphere, lines, lineEnds })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x24273a) //macchiato: base
    globalScene.current = scene

    const aspect = container.clientWidth / container.clientHeight
    const s = 1
    const camera = new THREE.OrthographicCamera(-s * aspect, s * aspect, s, -s, 0.1, 1000)
    camera.position.set(3, 2.5, 2.5)

    //TURN-PHYSICS
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
      new THREE.LineBasicMaterial({ color: 0x5b6078, linewidth: 3 }) //macchiato: surface2
    )
    //align corner to 0,0,0
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
        ; (cube.material as THREE.Material).dispose()
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